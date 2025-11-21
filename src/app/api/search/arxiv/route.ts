import { NextResponse } from "next/server";
import xml2js from "xml2js";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";

  if (!q) {
    return NextResponse.json({ results: [] });
  }

  const url = `http://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(
    q
  )}&start=0&max_results=5`;

  const xml = await fetch(url).then((r) => r.text());
  const parsed = await xml2js.parseStringPromise(xml, { explicitArray: false });
  const entries = parsed.feed.entry || [];
  const normalized = Array.isArray(entries) ? entries : [entries];

  const results = normalized.map((e: any) => ({
    // FIX: Strip the URL prefix to get just the ID
    id: e.id.replace(/http:\/\/arxiv\.org\/abs\//g, "").replace(/https:\/\/arxiv\.org\/abs\//g, ""),
    title: e.title?.trim(),
    summary: e.summary?.trim(),
    authors:
      e.author && Array.isArray(e.author)
        ? e.author.map((a: any) => a.name).join(", ")
        : e.author?.name || "Unknown",
    pdfUrl:
      e.link?.find?.((l: any) => l.$.type === "application/pdf")?.$.href ?? null,
  }));

  return NextResponse.json({ results });
}