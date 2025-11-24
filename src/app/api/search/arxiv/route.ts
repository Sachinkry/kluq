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

  // Construct Query
  let searchQuery = `all:${encodeURIComponent(q)}`;
  if (category !== "all") {
    searchQuery += `+AND+cat:${category}`;
  }

  const maxResults = 10;
  const url = `http://export.arxiv.org/api/query?search_query=${searchQuery}&start=0&max_results=${maxResults}&sortBy=${sortBy}&sortOrder=${sortOrder}`;

  try {
    const response = await fetch(url);
    const xml = await response.text();
    const parsed = await xml2js.parseStringPromise(xml, { explicitArray: false });
    
    const entries = parsed.feed.entry ? (Array.isArray(parsed.feed.entry) ? parsed.feed.entry : [parsed.feed.entry]) : [];

    const results = entries.map((e: any) => {
        const categories = Array.isArray(e.category) 
            ? e.category.map((c: any) => c.$.term) 
            : [e.category?.$.term];

        return {
            // 1. Fix ID
            id: e.id.replace(/http:\/\/arxiv\.org\/abs\//g, "").replace(/https:\/\/arxiv\.org\/abs\//g, "").replace("v1", ""),
            
            title: e.title?.replace(/\n/g, " ").trim(),
            
            // 2. FIX: Map 'summary' to 'abstract' to match UI component
            abstract: e.summary?.trim() || "No abstract available.",
            
            // 3. Fix Authors (Ensure it is a string, not array/object)
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