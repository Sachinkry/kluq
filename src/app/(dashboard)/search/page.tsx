"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);

  // Mock search
//   function handleSearch() {
//     if (!query.trim()) return;

//     // Fake results for demo
//     const mock = [
//       {
//         id: "paper-1",
//         title: "Attention Is All You Need",
//         authors: "Vaswani et al.",
//         summary: "Introduced the Transformer architecture which replaced recurrent models.",
//       },
//       {
//         id: "paper-2",
//         title: "Denoising Diffusion Probabilistic Models",
//         authors: "Ho et al.",
//         summary: "Foundation of diffusion models used for generative image synthesis.",
//       },
//       {
//         id: "paper-3",
//         title: "Chain-of-Thought Reasoning Improves LLM Performance",
//         authors: "Wei et al.",
//         summary: "Demonstrated that LLMs benefit from step-by-step reasoning traces.",
//       },
//     ];

//     setResults(mock);
//   }

    async function handleSearch() {
        if (!query.trim()) return;
    
        const res = await fetch(`/api/search/arxiv?q=${encodeURIComponent(query)}`);
        const data = await res.json();

        console.log(data);
    
        setResults(data.results || []);
    }
  
  return (
    <div className="w-full flex flex-col items-center py-10 px-4">
      {/* Title */}
      <h1 className="text-3xl font-bold text-center mb-6">
        Search Research Papers
      </h1>

      {/* Search bar */}
      <div className="w-full max-w-3xl flex items-center gap-3 mb-10">
        <Input
          placeholder="Search for transformer, diffusion, agents..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-12 text-lg"
        />
        <Button
          size="lg"
          className="h-12 px-6 bg-primary text-white"
          onClick={handleSearch}
        >
          Search
        </Button>
      </div>

      {/* Results */}
      {results.map((paper) => (
    <Card key={paper.id} className="border border-neutral-200 shadow-sm">
        <CardHeader>
        <CardTitle className="text-xl">{paper.title}</CardTitle>
        <CardDescription>{paper.authors}</CardDescription>
        </CardHeader>

        <CardContent>
        <p className="text-neutral-700 mb-4">{paper.summary}</p>

        <div className="flex gap-3">
            <Button
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={() => router.push(`/chat/${encodeURIComponent(paper.id)}`)}
            >
            Chat with this paper
            </Button>

            {paper.pdfUrl && (
            <a
                href={paper.pdfUrl}
                target="_blank"
                className="text-green-700 hover:underline text-sm font-medium"
            >
                PDF ↗
            </a>
            )}
        </div>
        </CardContent>
    </Card>
    ))}

    </div>
  );
}
