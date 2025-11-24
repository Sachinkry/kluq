import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { paperChunks, chats, messages } from "@/db/schema";
import { generateEmbedding } from "@/lib/embed";
import { desc, gt, sql, eq, and } from "drizzle-orm";
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
        
        // FIX: Update title if it's still the default "New Conversation"
        if (existingChat[0].title === "New Conversation") {
          await db.update(chats)
            .set({ title: titleSnippet })
            .where(eq(chats.id, chatId));
        }
      } else {
        // Create new if missing
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

    // 4. RAG: Embed & Search
    const queryVector = await generateEmbedding(query);
    const similarity = sql<number>`1 - (${paperChunks.embedding} <=> ${JSON.stringify(queryVector)})`;

    const relevantChunks = await db
      .select({ content: paperChunks.content, score: similarity })
      .from(paperChunks)
      .where(and(eq(paperChunks.paperId, pdfId), gt(similarity, 0.1)))
      .orderBy(desc(similarity))
      .limit(15);

    const context = relevantChunks.map((c) => c.content).join("\n\n");

    // 5. Stream Response & Save ASSISTANT Message
    const result = await streamText({
      model: google("gemini-2.5-flash"),
      system: `You are a helpful research assistant... CONTEXT: ${context || "No context found."}`,
      messages: chatMessages.map((m: any) => ({ role: m.role, content: m.content })),
      onFinish: async ({ text }) => {
        // Save the AI's full response to DB when stream finishes
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