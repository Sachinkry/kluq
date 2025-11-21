import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { paperChunks } from "@/db/schema";
import { generateEmbedding } from "@/lib/embed";
import { desc, gt, sql, eq, and } from "drizzle-orm";

// Initialize Google provider with your custom variable
const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const pdfId = body.pdfId || body.pdf_id;
    // 1. Sanitize messages: Remove any that are empty or have no content
    // This is critical for Gemini, which crashes on empty strings
    const rawMessages = body.messages || [];
    const messages = rawMessages.filter(
      (m: any) => m.content && m.content.trim() !== ""
    );

    const query = messages.length > 0 
      ? messages[messages.length - 1].content 
      : body.query;

    if (!pdfId || !query) {
      return NextResponse.json(
        { error: "Missing pdfId or query" },
        { status: 400 }
      );
    }

    // 2. Embed the user query
    const queryVector = await generateEmbedding(query);

    // 3. Similarity Search in Postgres
    const similarity = sql<number>`1 - (${paperChunks.embedding} <=> ${JSON.stringify(queryVector)})`;

    const relevantChunks = await db
      .select({
        content: paperChunks.content,
        score: similarity,
      })
      .from(paperChunks)
      .where(and(
        eq(paperChunks.paperId, pdfId),
        gt(similarity, 0.1) // Low threshold
      ))
      .orderBy(desc(similarity))
      .limit(5);

    const context = relevantChunks.map((c) => c.content).join("\n\n");

    if (!context) {
      return NextResponse.json(
        { error: "No relevant context found in PDF. Try asking a different question." },
        { status: 404 }
      );
    }

    // 4. Stream Response
    const result = await streamText({
      model: google("gemini-2.5-flash"), // Use 1.5-flash for stability (or 2.0-flash if you have access)
      system: `You are a helpful research assistant. Use the provided context from the PDF document to answer the user's question accurately and concisely. If the context doesn't contain enough information to answer the question, say so.
      
      CONTEXT FROM PDF:
      ${context}`,
      messages: messages.map((m: any) => ({ role: m.role, content: m.content })),
    });

    return result.toTextStreamResponse();

  } catch (error: any) {
    console.error("[Chat API] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}