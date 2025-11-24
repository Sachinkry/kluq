export const maxDuration = 60; 
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { db } from "@/db";
import { papers, paperChunks, chats } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { extractPdfText } from "@/lib/extract-pdf";
import { recursiveChunkText } from "@/lib/pdf-loader";
import { generateEmbeddings } from "@/lib/embed";
import { redis, ensureRedis } from "@/lib/redis";
import { createHash, randomUUID } from "crypto";
import xml2js from "xml2js";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { generateStructuredSummary } from "@/lib/summarize";

export async function POST(req: Request) {
  try {
    // 1. GET SESSION (Required to create a chat)
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { arxivId } = await req.json();
    if (!arxivId) return NextResponse.json({ error: "Missing arxivId" }, { status: 400 });

    const cleanId = arxivId
      .replace(/http:\/\/arxiv\.org\/abs\//g, "")
      .replace(/https:\/\/arxiv\.org\/abs\//g, "")
      .replace(".pdf", "")
      .trim();

    // 2. Metadata Fetching
    let paperTitle = `arXiv ${cleanId}`;
    let paperAbstract = "";
    try {
      const metaRes = await fetch(`http://export.arxiv.org/api/query?id_list=${cleanId}`);
      const parsed = await xml2js.parseStringPromise(await metaRes.text(), { explicitArray: false });
      const entry = Array.isArray(parsed?.feed?.entry) ? parsed.feed.entry[0] : parsed?.feed?.entry;
      if (entry?.title){
        paperTitle = entry.title.replace(/\n/g, " ").replace(/\s+/g, " ").trim();
        paperAbstract = entry.summary?.trim() || "No abstract available.";
      } 
    } catch (e) { console.error("Meta fetch failed", e); }

    // 3. Check Existing Paper by ArXiv ID
    const existingPaper = await db.select().from(papers).where(eq(papers.arxivId, cleanId)).limit(1);
    
    let finalPdfId = "";

    if (existingPaper.length > 0) {
      finalPdfId = existingPaper[0].id;
    } else {
      // 4. Download PDF
      const targetUrl = `https://arxiv.org/pdf/${cleanId}.pdf`;
      const pdfRes = await fetch(targetUrl);
      if (!pdfRes.ok) throw new Error("Failed to fetch PDF");
      const buffer = Buffer.from(await pdfRes.arrayBuffer());
      
      const fileHash = createHash("sha256").update(buffer).digest("hex");
      
      // 5. Double check hash to prevent duplicate content
      const hashCheck = await db.select().from(papers).where(eq(papers.fileHash, fileHash)).limit(1);
      
      if (hashCheck.length > 0) {
        finalPdfId = hashCheck[0].id;
      } else {
        // 6. Process New Paper (Parse & Summarize)
        console.log(`[ArXiv Load] Parsing ${cleanId} with Docling...`);
        const fullText = await extractPdfText(buffer);

        console.log(`[ArXiv Load] Generating Summary...`);
        const aiSummary = await generateStructuredSummary(fullText);
        
        finalPdfId = randomUUID();
        const base64 = buffer.toString("base64");
        
        let storedInRedis = false;
        try {
          if (process.env.REDIS_URL) {
             await ensureRedis(); 
             await redis.set(`pdf:${finalPdfId}`, base64); 
             storedInRedis = true; 
          }
        } catch (e) {
          console.warn("Redis write failed, falling back to DB storage");
        }

        // 7. Insert with Race Condition Handling
        try {
          await db.insert(papers).values({
            id: finalPdfId,
            arxivId: cleanId,
            title: paperTitle,
            pdfUrl: `/api/pdf/serve?pdfId=${finalPdfId}`,
            abstract: paperAbstract,
            summary: aiSummary,
            pdfData: storedInRedis ? null : base64,
            fileHash: fileHash,
          });
          
          // Chunking & Embedding (Only if insert succeeds)
          const chunks = recursiveChunkText(fullText, 2500, 500);
          const BATCH_SIZE = 10;
          for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
            const batchChunks = chunks.slice(i, i + BATCH_SIZE);
            const embeddings = await generateEmbeddings(batchChunks);
            await db.insert(paperChunks).values(batchChunks.map((c, idx) => ({
              paperId: finalPdfId, content: c, embedding: embeddings[idx]
            })));
          }

        } catch (dbError: any) {
          // ERROR CODE 23505 = Unique Violation in Postgres
          if (dbError.code === '23505') {
              console.log("[Load API] Race condition detected. Paper already exists. Fetching existing ID.");
              const existing = await db.select().from(papers).where(eq(papers.fileHash, fileHash)).limit(1);
              if (existing.length > 0) {
                  finalPdfId = existing[0].id;
              } else {
                  // If we hit a unique constraint but can't find the record, something is very wrong.
                  throw dbError;
              }
          } else {
              throw dbError; // Rethrow real errors
          }
        }
      }
    }

    // 8. Create Chat Session
    // This runs regardless of whether the paper was new or existing
    if (!finalPdfId) {
        throw new Error("Failed to determine PDF ID");
    }

    const existingChat = await db.select().from(chats)
      .where(and(eq(chats.userId, session.user.id), eq(chats.paperId, finalPdfId)))
      .limit(1);

    if (existingChat.length === 0) {
      await db.insert(chats).values({
        userId: session.user.id,
        paperId: finalPdfId,
        title: "New Conversation",
      });
    }

    return NextResponse.json({ 
      success: true, 
      pdfId: finalPdfId, 
      title: paperTitle 
    });

  } catch (error: any) {
    console.error("[Load API] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}