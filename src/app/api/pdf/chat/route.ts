import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { papers, chats, messages } from "@/db/schema"; // Removed paperChunks
import { eq, and } from "drizzle-orm"; // Removed desc, gt, sql
import { auth } from "@/lib/auth"; 
import { headers } from "next/headers";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(req: Request) {
  try {
    // 1. Verify Auth
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const pdfId = body.pdfId || body.pdf_id;
    const rawMessages = body.messages || [];
    
    // Filter empty messages
    const chatMessages = rawMessages.filter(
      (m: any) => m.content && m.content.trim() !== ""
    );

    const query = chatMessages.length > 0 
      ? chatMessages[chatMessages.length - 1].content 
      : body.query;

    if (!pdfId || !query) {
      return NextResponse.json({ error: "Missing pdfId or query" }, { status: 400 });
    }

    // 2. Retrieve or Create Chat Session
    let chatId: string;
    
    const existingChat = await db
      .select()
      .from(chats)
      .where(and(
        eq(chats.userId, session.user.id),
        eq(chats.paperId, pdfId)
      ))
      .limit(1);

    const titleSnippet = query.substring(0, 50) + "...";
      if (existingChat.length > 0) {
        chatId = existingChat[0].id;
        
        if (existingChat[0].title === "New Conversation") {
          await db.update(chats)
            .set({ title: titleSnippet })
            .where(eq(chats.id, chatId));
        }
      } else {
        const newChat = await db.insert(chats).values({
          userId: session.user.id,
          paperId: pdfId,
          title: titleSnippet, 
        }).returning();
        chatId = newChat[0].id;
      }

    // 3. Save USER Message to DB
    await db.insert(messages).values({
      chatId: chatId,
      role: "user",
      content: query,
    });

    // 4. FULL CONTEXT FETCH (Replaces RAG)
    // We fetch the entire paper text directly from Postgres.
    // Gemini 1.5 Flash handles this easily (up to ~700k words).
    const paperRecord = await db
      .select({ fullText: papers.fullText })
      .from(papers)
      .where(eq(papers.id, pdfId))
      .limit(1);

    const fullPaperText = paperRecord[0]?.fullText || "";

    // 5. Stream Response with REFINED PROMPT
    const result = await streamText({
      model: google("gemini-2.5-flash"),
      // STRICT SYSTEM PROMPT
      system: `You are a senior researcher assisting a user with a specific academic paper. 
      
      CORE INSTRUCTIONS:
      1. **Answer directly:** Do not start with "Based on the paper..." or "The document states...". Just answer.
      2. **Be concise:** If the user asks a simple question (e.g., "What is the accuracy?"), give a 1-sentence answer. Do not summarize the whole paper unless asked.
      3. **Stay grounded:** Use ONLY the provided paper text. If the answer isn't there, say "I cannot find that information in this paper."
      4. **Formatting:** Use Markdown. Use bullet points for lists. Bold key metrics.
      
      FULL PAPER TEXT:
      ${fullPaperText}`,
      messages: chatMessages.map((m: any) => ({ role: m.role, content: m.content })),
      onFinish: async ({ text }) => {
        if (text) {
          await db.insert(messages).values({
            chatId: chatId,
            role: "assistant",
            content: text,
          });
        }
      },
    });

    return result.toTextStreamResponse();

  } catch (error: any) {
    console.error("[Chat API] Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}