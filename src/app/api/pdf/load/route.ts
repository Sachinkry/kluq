export const maxDuration = 60; // Allow up to 60s for processing PDFs

import { NextResponse } from "next/server";
import { db } from "@/db";
import { papers, paperChunks } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getPdfTextFromUrl, recursiveChunkText } from "@/lib/pdf-loader";
import { generateEmbeddings } from "@/lib/embed";

export async function POST(req: Request) {
  try {
    // 1. Parse Body
    const { arxivId, title, pdfUrl } = await req.json();

    if (!arxivId) {
      return NextResponse.json({ error: "Missing arxivId" }, { status: 400 });
    }

    // 2. Sanitize the ID
    // This handles cases where the frontend sends a full URL instead of just the ID
    const cleanId = arxivId
      .replace(/http:\/\/arxiv\.org\/abs\//g, "")
      .replace(/https:\/\/arxiv\.org\/abs\//g, "")
      .replace(".pdf", "")
      .trim();

    console.log(`[Load API] Processing request for ID: ${cleanId}`);

    // 3. Check if already indexed (Deduping)
    const existingPaper = await db
      .select()
      .from(papers)
      .where(eq(papers.id, cleanId))
      .limit(1);

    if (existingPaper.length > 0) {
      console.log(`[Load API] Paper ${cleanId} already exists.`);
      return NextResponse.json({ 
        message: "Already indexed", 
        pdfId: cleanId,
        success: true 
      });
    }

    // 4. Construct Target URL
    // If a specific PDF URL wasn't provided, guess it from the arXiv ID
    const targetUrl = pdfUrl || `https://arxiv.org/pdf/${cleanId}.pdf`;
    console.log(`[Load API] Fetching PDF from: ${targetUrl}`);

    // 5. Extract Text (This can be slow)
    const fullText = await getPdfTextFromUrl(targetUrl);
    console.log(`[Load API] Extracted ${fullText.length} characters.`);

    // 6. Save Paper Metadata FIRST
    // We do this before chunks so we have the parent record
    await db.insert(papers).values({
      id: cleanId,
      title: title || "Untitled Paper",
      pdfUrl: targetUrl,
      abstract: "", // Optional: You could scrape this too if needed
    });

    // 7. Chunk the Text
    // 1000 chars ~ 200-250 tokens. Good size for retrieval.
    const chunks = recursiveChunkText(fullText, 1000, 200);
    console.log(`[Load API] Created ${chunks.length} text chunks.`);

    // 8. Generate Embeddings & Save Batches
    // Processing in batches prevents hitting API rate limits or timeouts
    const BATCH_SIZE = 10; 
    
    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batchChunks = chunks.slice(i, i + BATCH_SIZE);
      
      // Generate embeddings for this batch (calls Jina AI)
      const embeddings = await generateEmbeddings(batchChunks);

      // Prepare database rows
      const valuesToInsert = batchChunks.map((chunkText, idx) => ({
        paperId: cleanId,
        content: chunkText,
        embedding: embeddings[idx],
      }));

      // Insert batch
      await db.insert(paperChunks).values(valuesToInsert);
      console.log(`[Load API] Saved batch ${Math.ceil((i + 1) / BATCH_SIZE)}`);
    }

    console.log(`[Load API] Successfully indexed ${cleanId}`);
    return NextResponse.json({ 
      success: true, 
      pdfId: cleanId,
      chunks: chunks.length 
    });

  } catch (error: any) {
    console.error("[Load API] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" }, 
      { status: 500 }
    );
  }
}