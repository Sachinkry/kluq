"use client"

import { useState, useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SearchIcon, Filter, ArrowUpDown, Loader2 } from "lucide-react"
import { PaperCard } from "@/modules/search/ui/components/paper-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CuratedTopics } from "@/modules/search/ui/components/curated-topics"
import { useRouter, useSearchParams } from "next/navigation"

const CATEGORIES = [
    { value: "all", label: "All Categories" },
    { value: "cs.AI", label: "Artificial Intelligence (cs.AI)" },
    { value: "cs.LG", label: "Machine Learning (cs.LG)" },
    { value: "cs.CL", label: "Computation & Language (NLP)" },
    { value: "cs.CV", label: "Computer Vision (cs.CV)" },
    { value: "cs.RO", label: "Robotics (cs.RO)" },
    { value: "cs.MA", label: "Multiagent Systems (cs.MA)" },
]

const SORT_OPTIONS = [
    { value: "relevance", label: "Relevance" },
    { value: "submittedDate", label: "Submission Date" },
    { value: "lastUpdatedDate", label: "Last Updated" },
]

export default function SearchView() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state from URL params if they exist
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "all");
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "relevance");
  
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // The actual API call
  const performSearch = useCallback(async (searchQuery: string, searchCat: string, searchSort: string) => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setHasSearched(true);
    
    try {
      const params = new URLSearchParams({
          q: searchQuery,
          category: searchCat,
          sortBy: searchSort,
          sortOrder: "descending"
      });
      
      const res = await fetch(`/api/search/arxiv?${params.toString()}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch (error) {
      console.error("Search failed:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 1. Handle User Interaction (Click Search)
  const handleSearchClick = () => {
    if (!query.trim()) return;

    // Update URL
    const params = new URLSearchParams();
    params.set("q", query);
    if (category !== "all") params.set("category", category);
    if (sortBy !== "relevance") params.set("sortBy", sortBy);
    
    router.push(`/search?${params.toString()}`);
    
    // Trigger Search
    performSearch(query, category, sortBy);
  };

  // 2. Handle Initial Load / URL Changes
  useEffect(() => {
    const urlQuery = searchParams.get("q");
    const urlCat = searchParams.get("category") || "all";
    const urlSort = searchParams.get("sortBy") || "relevance";

    if (urlQuery) {
        setQuery(urlQuery);
        setCategory(urlCat);
        setSortBy(urlSort);
        performSearch(urlQuery, urlCat, urlSort);
    }
  }, [searchParams, performSearch]);

  return (
    <div className="w-full flex flex-col items-center py-10 px-4 md:px-8 min-h-screen bg-slate-50/50">
      <div className="mb-10 text-center space-y-2">
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Research Assistant</h1>
        <p className="text-muted-foreground text-lg">
            Search 2M+ papers from ArXiv with AI-powered analysis
        </p>
      </div>

      {/* SEARCH & FILTER TOOLBAR */}
      <div className="w-full max-w-4xl mb-12 space-y-4">
        <div className="flex gap-3">
            <Input
                placeholder="Search papers (e.g. 'LLM reasoning', 'diffusion models')"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearchClick()}
                className="text-lg h-12 shadow-sm border-slate-200 focus-visible:ring-emerald-500"
            />
            <Button 
                onClick={handleSearchClick} 
                size="lg" 
                disabled={loading} 
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 h-12 font-medium"
            >
                {loading ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> 
                ) : (
                    <SearchIcon className="mr-2 h-5 w-5" />
                )}
                Search
            </Button>
        </div>

        {/* FILTERS */}
        <div className="flex flex-wrap gap-3">
            <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-[240px] h-10 bg-white border-slate-200">
                    <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                    {CATEGORIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px] h-10 bg-white border-slate-200">
                    <ArrowUpDown className="mr-2 h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                    {SORT_OPTIONS.map((s) => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
      </div>

      {/* SHOW CURATED TOPICS ONLY IF NO SEARCH ACTIVE */}
      {!hasSearched && !query && (
        <div className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700">
            <CuratedTopics />
        </div>
      )}

      {/* SEARCH RESULTS */}
      <div className="w-full max-w-4xl space-y-6">
        {results.map((paper) => (
          <PaperCard key={paper.id} paper={paper} />
        ))}
        
        {!loading && hasSearched && results.length === 0 && (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-200 shadow-sm">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-4">
                <SearchIcon className="h-6 w-6 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">No papers found</h3>
            <p className="text-muted-foreground max-w-xs mx-auto mt-1">
                We couldn't find anything matching &quot;{query}&quot;. Try different keywords or check your filters.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}