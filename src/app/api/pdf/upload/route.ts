export const maxDuration = 60;
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { db } from "@/db";
import { papers, paperChunks } from "@/db/schema";
import { eq, and } from "drizzle-orm"; 
import { extractPdfText } from "@/lib/extract-pdf";
import { recursiveChunkText } from "@/lib/pdf-loader";
import { generateEmbeddings } from "@/lib/embed";
import { randomUUID, createHash } from "crypto"; // Import createHash
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

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "File must be a PDF" }, { status: 400 });
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size must be less than 10MB" },
        { status: 400 }
      );
    }

    const fileName = file.name.replace(/\.pdf$/i, "");
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. GENERATE FILE HASH (SHA-256)
    const fileHash = createHash("sha256").update(buffer).digest("hex");
    console.log(`[Upload API] File Hash: ${fileHash}`);

    // 2. CHECK FOR EXISTING PAPER BY HASH
    const existingPaper = await db
      .select()
      .from(papers)
      .where(eq(papers.fileHash, fileHash))
      .limit(1);

    if (existingPaper.length > 0) {
      console.log(`[Upload API] Duplicate found by hash. Returning ID: ${existingPaper[0].id}`);
      return NextResponse.json({
        success: true,
        pdfId: existingPaper[0].id,
        chunks: 0,
        title: existingPaper[0].title, // Return original title
        message: "File already exists. Redirecting...",
      });
    }

    // 3. Extract Text (Only if it's a new file)
    console.log(`[Upload API] Extracting text from PDF: ${fileName}`);
    const fullText = await extractPdfText(buffer);

    // --- DEBUG: VIEW PARSING QUALITY ---
    console.log("============== RAW PDF TEXT START ==============");
    console.log(fullText.slice(0, 2000)); // Print first 2000 chars
    console.log("============== RAW PDF TEXT END ==============");
    // -----------------------------------

    if (fullText.length === 0) {
      return NextResponse.json(
        { error: "Could not extract text from PDF" },
        { status: 400 }
      );
    }

    console.log(`[Upload API] Generating structured summary...`);
    const aiSummary = await generateStructuredSummary(fullText);
    console.log(`[Upload API] Structured summary generated: ${aiSummary}`);
    const fallbackAbstract = fullText.slice(0, 500) + "...";

    // 4. Save New Paper
    const pdfId = randomUUID();
    const base64 = buffer.toString("base64");
    let storedInRedis = false;
    
    try {
      if (process.env.REDIS_URL) {
        await ensureRedis();
        await redis.set(`pdf:${pdfId}`, base64);
        storedInRedis = true;
      }
    } catch (error) {
      console.warn("[Upload API] Redis not available, storing PDF in database");
    }

    await db.insert(papers).values({
      id: pdfId,
      title: fileName || "Untitled Document",
      pdfUrl: `/api/pdf/serve?pdfId=${pdfId}`, 
      abstract: fallbackAbstract,
      summary: aiSummary,
      pdfData: storedInRedis ? null : base64,
      fileHash: fileHash, // Save the hash!
    });

    // 5. Chunk and Embed
    const chunks = recursiveChunkText(fullText, 1000, 200);
    console.log(`[Upload API] Created ${chunks.length} text chunks.`);

    const BATCH_SIZE = 10;
    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batchChunks = chunks.slice(i, i + BATCH_SIZE);
      const embeddings = await generateEmbeddings(batchChunks);

      const valuesToInsert = batchChunks.map((chunkText, idx) => ({
        paperId: pdfId,
        content: chunkText,
        embedding: embeddings[idx],
      }));

      await db.insert(paperChunks).values(valuesToInsert);
      console.log(`[Upload API] Saved batch ${Math.ceil((i + 1) / BATCH_SIZE)}/${Math.ceil(chunks.length / BATCH_SIZE)}`);
    }

    console.log(`[Upload API] Successfully processed PDF: ${pdfId}`);

    const existingChat = await db.select().from(chats)
      .where(and(eq(chats.userId, session.user.id), eq(chats.paperId, pdfId))) // pdfId is the UUID you generated
      .limit(1);

    if (existingChat.length === 0) {
      await db.insert(chats).values({
        userId: session.user.id,
        paperId: pdfId,
        title: "New Conversation",
      });
    }
    return NextResponse.json({
      success: true,
      pdfId: pdfId,
      chunks: chunks.length,
      title: fileName,
    });

  } catch (error: any) {
    console.error("[Upload API] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}