import { NextResponse } from "next/server";
import { db } from "@/db";
import { papers } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const pdfId = searchParams.get("pdfId");

    if (!pdfId) {
      return NextResponse.json({ error: "Missing pdfId" }, { status: 400 });
    }

    const paper = await db
      .select()
      .from(papers)
      .where(eq(papers.id, pdfId))
      .limit(1);

    if (paper.length === 0) {
      return NextResponse.json({ error: "PDF not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: paper[0].id,
      title: paper[0].title,
      abstract: paper[0].abstract,
      pdfUrl: paper[0].pdfUrl,
      createdAt: paper[0].createdAt,
    });
  } catch (error: any) {
    console.error("[Info API] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

