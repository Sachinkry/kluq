// src/app/api/pdf/serve/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { redis, ensureRedis } from "@/lib/redis";
import { db } from "@/db";
import { papers } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const pdfId = searchParams.get("pdfId");

  if (!pdfId) {
    return NextResponse.json({ error: "Missing pdfId" }, { status: 400 });
  }

  let base64: string | null = null;

  // 1. FAST PATH: Check Redis Cache
  try {
    await ensureRedis();
    base64 = await redis.get(`pdf:${pdfId}`);
    if (base64) {
        console.log(`[Serve API] Cache HIT for ${pdfId}`);
    }
  } catch (error) {
    console.warn("[Serve API] Redis unavailable, skipping cache check");
  }

  // 2. SLOW PATH: Fetch from Neon Database
  if (!base64) {
    console.log(`[Serve API] Cache MISS for ${pdfId}. Fetching from DB...`);
    
    const paper = await db
      .select({ pdfData: papers.pdfData })
      .from(papers)
      .where(eq(papers.id, pdfId))
      .limit(1);

    if (paper.length > 0 && paper[0].pdfData) {
      base64 = paper[0].pdfData;

      // 3. RE-HYDRATE CACHE (Read-Through)
      // Put it back in Redis so the next request is fast
      try {
        if (process.env.REDIS_URL) {
            await ensureRedis();
            await redis.set(`pdf:${pdfId}`, base64, { EX: 86400 }); // 24h TTL
        }
      } catch (e) {
        console.warn("[Serve API] Failed to re-cache PDF in Redis");
      }
    }
  }

  if (!base64) {
    return NextResponse.json({ error: "PDF not found" }, { status: 404 });
  }

  // 4. Serve File
  const buffer = Buffer.from(base64, "base64");

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Length": buffer.length.toString(),
      // Browser caching: cache for 1 year (immutable) since ID is unique
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}