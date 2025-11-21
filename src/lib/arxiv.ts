// src/lib/arxiv.ts
// Server-side arXiv search. No external libs. Raw HTTP + XML parsing.

export async function searchArxiv(query: string, maxResults = 5): Promise<Paper[]> {
  if (!query.trim()) return [];

  const encodedQuery = encodeURIComponent(query);
  const url = `http://export.arxiv.org/api/query?search_query=all:${encodedQuery}&start=0&max_results=${maxResults}&sortBy=relevance&sortOrder=descending`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`arXiv API error: ${response.status}`);

    const xml = await response.text();

    // Simple XML → JSON parser (no deps, handles arXiv's Atom format)
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, "text/xml");
    const entries = doc.querySelectorAll("entry");

    const papers: Paper[] = [];
    entries.forEach((entry) => {
      const id = entry.querySelector("id")?.textContent?.replace("http://arxiv.org/abs/", "") || "";
      const title = entry.querySelector("title")?.textContent?.trim() || "Untitled";
      const summary = entry.querySelector("summary")?.textContent?.trim() || "";
      
      const authors = Array.from(entry.querySelectorAll("author name")).map((author) => author.textContent?.trim() || "Unknown");
      
      const published = entry.querySelector("published")?.textContent || new Date().toISOString();
      
      const pdfLink = Array.from(entry.querySelectorAll("link"))
        .find((link) => link.getAttribute("title") === "pdf")?.getAttribute("href") || 
        `https://arxiv.org/pdf/${id}.pdf`;
      
      const category = entry.querySelector("arxiv:primary_category")?.getAttribute("term") || "unknown";

      papers.push({
        id,
        title,
        authors,
        published,
        abstract: summary,
        pdfUrl: pdfLink,
        category,
      });
    });

    return papers;
  } catch (error) {
    console.error("arXiv search failed:", error);
    return [];
  }
}

export interface Paper {
  id: string;
  title: string;
  authors: string[];
  published: string;
  abstract: string;
  pdfUrl: string;
  category: string;
}