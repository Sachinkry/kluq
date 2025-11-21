// src/modules/research/ui/search-page.tsx
"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SearchIcon } from "lucide-react"
import { searchArxiv } from "@/lib/arxiv"
import { PaperCard } from "../components/paper-card"

export function SearchPage() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // Replace the handleSearch function
const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const { results } = await res.json();
      setResults(results);
    } catch (error) {
      console.error("Search failed:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold mb-4">Search arXiv Papers</h1>
        <p className="text-muted-foreground">Find any AI paper instantly and chat with it</p>
      </div>

      <div className="flex gap-3 max-w-2xl mx-auto mb-12">
        <Input
          placeholder="e.g. attention is all you need, grok-1 technical report, llama 3"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="text-lg h-12"
        />
        <Button onClick={handleSearch} size="lg" disabled={loading}>
          <SearchIcon className="mr-2" />
          Search
        </Button>
      </div>

      <div className="grid gap-6">
        {loading && <div className="text-center">Searching arXiv...</div>}
        {results.map((paper) => (
          <PaperCard key={paper.id} paper={paper} />
        ))}
        {!loading && results.length === 0 && query && (
          <p className="text-center text-muted-foreground">No results found. Try different keywords.</p>
        )}
      </div>
    </div>
  )
}