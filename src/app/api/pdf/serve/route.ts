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

  // Try Redis first
  try {
    await ensureRedis();
    base64 = await redis.get(`pdf:${pdfId}`);
  } catch (error) {
    console.warn("[Serve API] Redis not available, checking database");
  }

  // Fallback to database if Redis doesn't have it
  if (!base64) {
    const paper = await db
      .select({ pdfData: papers.pdfData })
      .from(papers)
      .where(eq(papers.id, pdfId))
      .limit(1);

    if (paper.length > 0 && paper[0].pdfData) {
      base64 = paper[0].pdfData;
    }
  }

  if (!base64) {
    return NextResponse.json({ error: "PDF not found" }, { status: 404 });
  }

  // Convert back to binary buffer
  const buffer = Buffer.from(base64, "base64");

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Length": buffer.length.toString(),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
