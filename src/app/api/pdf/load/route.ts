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
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { arxivId } = await req.json();
    if (!arxivId) return NextResponse.json({ error: "Missing arxivId" }, { status: 400 });

    const cleanId = arxivId.replace(/http:\/\/arxiv\.org\/abs\//g, "").replace(/https:\/\/arxiv\.org\/abs\//g, "").replace(".pdf", "").trim();

    // Metadata Fetching
    let paperTitle = `arXiv ${cleanId}`;
    let paperAbstract = "";
    try {
      const metaRes = await fetch(`http://export.arxiv.org/api/query?id_list=${cleanId}`);
      const parsed = await xml2js.parseStringPromise(await metaRes.text(), { explicitArray: false });
      const entry = Array.isArray(parsed?.feed?.entry) ? parsed.feed.entry[0] : parsed?.feed?.entry;
      if (entry?.title) {
        paperTitle = entry.title.replace(/\n/g, " ").replace(/\s+/g, " ").trim();
        paperAbstract = entry.summary?.trim() || "No abstract available.";
      }
    } catch (e) { console.error("Meta fetch failed", e); }

    // Check Existing
    const existingPaper = await db.select().from(papers).where(eq(papers.arxivId, cleanId)).limit(1);
    let finalPdfId = "";

    if (existingPaper.length > 0) {
      finalPdfId = existingPaper[0].id;
    } else {
      // Download & Process
      const targetUrl = `https://arxiv.org/pdf/${cleanId}.pdf`;
      const pdfRes = await fetch(targetUrl);
      if (!pdfRes.ok) throw new Error("Failed to fetch PDF");
      const buffer = Buffer.from(await pdfRes.arrayBuffer());
      
      const fileHash = createHash("sha256").update(buffer).digest("hex");
      const hashCheck = await db.select().from(papers).where(eq(papers.fileHash, fileHash)).limit(1);
      
      if (hashCheck.length > 0) {
        finalPdfId = hashCheck[0].id;
      } else {
        console.log(`[ArXiv Load] Parsing ${cleanId}...`);
        const fullText = await extractPdfText(buffer);
        const summary = await generateStructuredSummary(fullText);
        
        finalPdfId = randomUUID();
        const base64 = buffer.toString("base64");
        
        // Cache in Redis (Best Effort)
        try {
          if (process.env.REDIS_URL) {
             await ensureRedis(); 
             await redis.set(`pdf:${finalPdfId}`, base64, { EX: 86400 }); 
          }
        } catch (e) { console.warn("Redis write failed"); }

        // Insert DB
        try {
          await db.insert(papers).values({
            id: finalPdfId,
            arxivId: cleanId,
            title: paperTitle,
            pdfUrl: `/api/pdf/serve?pdfId=${finalPdfId}`,
            abstract: paperAbstract,
            summary: summary,
            fullText: fullText,
            pdfData: base64, // <--- ALWAYS SAVE DATA HERE
            fileHash: fileHash,
          });
          
          // Chunking
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
          if (dbError.code === '23505') {
              // Race condition handling
              const existing = await db.select().from(papers).where(eq(papers.fileHash, fileHash)).limit(1);
              if (existing.length > 0) finalPdfId = existing[0].id;
          } else {
              throw dbError;
          }
        }
      }
    }

    // Create Chat
    const existingChat = await db.select().from(chats)
      .where(and(eq(chats.userId, session.user.id), eq(chats.paperId, finalPdfId))).limit(1);

    if (existingChat.length === 0) {
      await db.insert(chats).values({ userId: session.user.id, paperId: finalPdfId, title: "New Conversation" });
    }

    return NextResponse.json({ success: true, pdfId: finalPdfId, title: paperTitle });

  } catch (error: any) {
    console.error("[Load API] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}