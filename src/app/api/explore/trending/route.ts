import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function GET() {
  try {
    // 1. Fetch the Trending Page with 1-hour caching
    const response = await fetch("https://huggingface.co/papers/trending", {
      next: { revalidate: 3600 }, // Cache for 1 hour
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; KluqBot/1.0; +http://kluq.ai)",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch Hugging Face trending page");
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const papers: any[] = [];

    // 2. Parse the HTML
    // Hugging Face paper cards are typically article elements or specific divs
    $("article").each((_, element) => {
      // Extract Link & ID
      const linkTag = $(element).find("a[href^='/papers/']").first();
      const href = linkTag.attr("href");
      
      if (href) {
        const id = href.replace("/papers/", "");
        const title = $(element).find("h3").text().trim();
        
        // Attempt to find image
        const imgTag = $(element).find("img").first();
        const thumbnail = imgTag.attr("src");

        // Attempt to find authors (usually a list of names or "Submitted by")
        // We'll take a best guess or default to "Community"
        const authorText = $(element).text().includes("Submitted by") 
            ? "Submitted by " + $(element).text().split("Submitted by")[1].trim().split(/\s+/)[0]
            : "Hugging Face Community";

        if (id && title) {
          papers.push({
            id,
            title,
            authors: authorText,
            published: new Date().toISOString().split("T")[0], // Default to today for trending
            abstract: "Trending on Hugging Face. Click to chat with this paper.",
            pdfUrl: `https://arxiv.org/pdf/${id}.pdf`,
            categories: ["Trending", "Deep Learning"],
            thumbnail: thumbnail || null
          });
        }
      }
    });

    // Return top 10 trending
    return NextResponse.json({ papers: papers.slice(0, 10) });

  } catch (error) {
    console.error("Trending API Error:", error);
    return NextResponse.json({ papers: [] }, { status: 500 });
  }
}