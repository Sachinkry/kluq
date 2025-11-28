import { NextResponse } from "next/server";
import xml2js from "xml2js";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "all";
  const sortBy = searchParams.get("sortBy") || "relevance"; 
  const sortOrder = searchParams.get("sortOrder") || "descending";

  if (!q && category === "all") {
    return NextResponse.json({ results: [] });
  }

  let searchQuery = `all:${encodeURIComponent(q)}`;
  if (category !== "all") {
    searchQuery += `+AND+cat:${category}`;
  }

  const maxResults = 10;
  // FIX 1: Use HTTPS
  const url = `https://export.arxiv.org/api/query?search_query=${searchQuery}&start=0&max_results=${maxResults}&sortBy=${sortBy}&sortOrder=${sortOrder}`;

  try {
    // FIX 2: Add User-Agent header (Required by ArXiv)
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Kluq-AI-Research/1.0 (mailto:admin@kluq.ai)"
      }
    });

    if (!response.ok) {
        throw new Error(`ArXiv API Error: ${response.status} ${response.statusText}`);
    }

    const xml = await response.text();
    
    // Safety check: ensure response is actually XML before parsing
    if (xml.trim().startsWith("R") || !xml.includes("<feed")) {
        console.warn("ArXiv Rate Limit/Error:", xml);
        return NextResponse.json({ results: [] });
    }

    const parsed = await xml2js.parseStringPromise(xml, { explicitArray: false });
    const entries = parsed.feed.entry ? (Array.isArray(parsed.feed.entry) ? parsed.feed.entry : [parsed.feed.entry]) : [];

    const results = entries.map((e: any) => {
        const categories = Array.isArray(e.category) 
            ? e.category.map((c: any) => c.$.term) 
            : [e.category?.$.term];

        return {
            id: e.id.replace(/http:\/\/arxiv\.org\/abs\//g, "").replace(/https:\/\/arxiv\.org\/abs\//g, "").replace("v1", ""),
            title: e.title?.replace(/\n/g, " ").trim(),
            abstract: e.summary?.trim() || "No abstract available.",
            authors: e.author 
                ? (Array.isArray(e.author) 
                    ? e.author.map((a: any) => a.name).join(", ") 
                    : e.author.name)
                : "Unknown",
            published: e.published,
            updated: e.updated,
            categories: categories,
            pdfUrl: e.link?.find?.((l: any) => l.$.type === "application/pdf")?.$.href ?? null,
        };
    });

    return NextResponse.json({ results });
  } catch (error) {
    console.error("ArXiv Search Error:", error);
    return NextResponse.json({ results: [] }, { status: 500 });
  }
}