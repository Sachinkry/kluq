export const maxDuration = 60;
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { db } from "@/db";
import { papers, paperChunks } from "@/db/schema";
import { eq, and } from "drizzle-orm"; 
import { extractPdfText } from "@/lib/extract-pdf";
import { recursiveChunkText } from "@/lib/pdf-loader";
import { generateEmbeddings } from "@/lib/embed";
import { randomUUID, createHash } from "crypto"; 
import { redis, ensureRedis } from "@/lib/redis";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { chats } from "@/db/schema";
import { generateStructuredSummary } from "@/lib/summarize";

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (file.type !== "application/pdf") return NextResponse.json({ error: "File must be a PDF" }, { status: 400 });

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) return NextResponse.json({ error: "File size must be less than 10MB" }, { status: 400 });

    const fileName = file.name.replace(/\.pdf$/i, "");
    const buffer = Buffer.from(await file.arrayBuffer());

    // 1. GENERATE FILE HASH
    const fileHash = createHash("sha256").update(buffer).digest("hex");

    // 2. CHECK FOR DUPLICATES
    const existingPaper = await db.select().from(papers).where(eq(papers.fileHash, fileHash)).limit(1);
    if (existingPaper.length > 0) {
      // If duplicate, ensure a chat exists for this user before returning
      const existingChat = await db.select().from(chats)
        .where(and(eq(chats.userId, session.user.id), eq(chats.paperId, existingPaper[0].id))).limit(1);
      
      if (existingChat.length === 0) {
        await db.insert(chats).values({ userId: session.user.id, paperId: existingPaper[0].id, title: "New Conversation" });
      }

      return NextResponse.json({
        success: true,
        pdfId: existingPaper[0].id,
        chunks: 0,
        title: existingPaper[0].title,
        message: "File already exists. Redirecting...",
      });
    }

    // 3. PARSE & SUMMARIZE
    console.log(`[Upload API] Extracting text...`);
    const fullText = await extractPdfText(buffer);
    if (fullText.length === 0) return NextResponse.json({ error: "Could not extract text" }, { status: 400 });

    console.log(`[Upload API] Generating summary...`);
    const aiSummary = await generateStructuredSummary(fullText);
    const fallbackAbstract = fullText.slice(0, 500) + "...";

    // 4. SAVE TO STORAGE (Neon + Redis)
    const pdfId = randomUUID();
    const base64 = buffer.toString("base64");
    
    // Cache in Redis (Best Effort)
    try {
      if (process.env.REDIS_URL) {
        await ensureRedis();
        await redis.set(`pdf:${pdfId}`, base64, { EX: 86400 }); // 24h TTL
      }
    } catch (error) {
      console.warn("[Upload API] Redis write failed, continuing...");
    }

    // Persist in DB (Source of Truth)
    await db.insert(papers).values({
      id: pdfId,
      title: fileName || "Untitled Document",
      pdfUrl: `/api/pdf/serve?pdfId=${pdfId}`, 
      abstract: fallbackAbstract,
      summary: aiSummary,
      fullText: fullText,
      pdfData: base64, // <--- ALWAYS SAVE DATA HERE
      fileHash: fileHash,
    });

    // 5. CHUNK & EMBED
    const chunks = recursiveChunkText(fullText, 1000, 200);
    const BATCH_SIZE = 10;
    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batchChunks = chunks.slice(i, i + BATCH_SIZE);
      const embeddings = await generateEmbeddings(batchChunks);
      await db.insert(paperChunks).values(batchChunks.map((c, idx) => ({
        paperId: pdfId, content: c, embedding: embeddings[idx]
      })));
    }

    // 6. CREATE CHAT
    await db.insert(chats).values({
      userId: session.user.id,
      paperId: pdfId,
      title: "New Conversation",
    });

    return NextResponse.json({ success: true, pdfId: pdfId, chunks: chunks.length, title: fileName });

  } catch (error: any) {
    console.error("[Upload API] Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}