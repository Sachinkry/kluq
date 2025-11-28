import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const paperId = searchParams.get("paperId");

  if (!paperId) {
    return NextResponse.json({ error: "Missing paperId" }, { status: 400 });
  }

  try {
    // Fetch Data from Semantic Scholar
    const s2Url = `https://api.semanticscholar.org/graph/v1/paper/arXiv:${paperId}?fields=title,authors,year,citationCount,abstract,references.title,references.paperId,references.authors,references.year,references.citationCount,citations.title,citations.paperId,citations.authors,citations.year,citations.citationCount`;
    
    const response = await fetch(s2Url);
    if (!response.ok) {
        return NextResponse.json({ nodes: [], links: [] });
    }
    
    const data = await response.json();

    const nodes: any[] = [];
    const links: any[] = [];
    const seen = new Set<string>();

    const getAuthorStr = (authors: any[]) => authors && authors.length > 0 ? authors[0].name + (authors.length > 1 ? " et al." : "") : "Unknown Author";

    // Helper: Log scale sizing function to prevent massive nodes
    const getSize = (citations: number) => Math.max(4, Math.log(citations + 1) * 2);

    // 1. Central Node
    const rootId = data.paperId || "root";
    nodes.push({
        id: rootId,
        title: data.title,
        authors: getAuthorStr(data.authors),
        year: data.year || new Date().getFullYear(),
        citationCount: data.citationCount || 0,
        group: "root",
        val: getSize(data.citationCount || 0), // Size based on REAL citations
        abstract: data.abstract
    });
    seen.add(rootId);

    // 2. References (Past)
    data.references?.slice(0, 25).forEach((ref: any) => {
        if (ref.paperId && !seen.has(ref.paperId)) {
            nodes.push({
                id: ref.paperId,
                title: ref.title,
                authors: getAuthorStr(ref.authors),
                year: ref.year || (data.year - 2), // Fallback
                citationCount: ref.citationCount || 0,
                group: "reference",
                val: getSize(ref.citationCount || 0)
            });
            links.push({ source: rootId, target: ref.paperId });
            seen.add(ref.paperId);
        }
    });

    // 3. Citations (Future)
    data.citations?.slice(0, 25).forEach((cit: any) => {
        if (cit.paperId && !seen.has(cit.paperId)) {
            nodes.push({
                id: cit.paperId,
                title: cit.title,
                authors: getAuthorStr(cit.authors),
                year: cit.year || (data.year + 1), // Fallback
                citationCount: cit.citationCount || 0,
                group: "citation",
                val: getSize(cit.citationCount || 0)
            });
            links.push({ source: cit.paperId, target: rootId });
            seen.add(cit.paperId);
        }
    });

    return NextResponse.json({ nodes, links });

  } catch (error: any) {
    console.error("Graph API Error:", error);
    return NextResponse.json({ error: "Failed to fetch graph data" }, { status: 500 });
  }
}