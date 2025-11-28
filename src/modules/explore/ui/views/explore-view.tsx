"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, TrendingUp, Calendar, ArrowRight, Dice5, Loader2 } from "lucide-react";
import { PaperCard } from "@/modules/search/ui/components/paper-card";

export default function ExploreView() {
  const router = useRouter();
  const [trendingPapers, setTrendingPapers] = useState<any[]>([]);
  const [loadingTrending, setLoadingTrending] = useState(true);
  
  const [latestPapers, setLatestPapers] = useState<any[]>([]);
  const [loadingLatest, setLoadingLatest] = useState(false);
  const [activeCategory, setActiveCategory] = useState("cs.AI");

  // 1. Fetch Trending (Hugging Face)
  useEffect(() => {
    async function fetchTrending() {
      try {
        const res = await fetch("/api/explore/trending");
        const data = await res.json();
        setTrendingPapers(data.papers || []);
      } catch (e) {
        console.error("Failed to load trending papers", e);
      } finally {
        setLoadingTrending(false);
      }
    }
    fetchTrending();
  }, []);

  // 2. Fetch Latest (ArXiv)
  useEffect(() => {
    async function fetchLatest() {
      setLoadingLatest(true);
      try {
        const res = await fetch(`/api/search/arxiv?q=AI&category=${activeCategory}&sortBy=submittedDate&sortOrder=descending`);
        const data = await res.json();
        setLatestPapers(data.results?.slice(0, 6) || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingLatest(false);
      }
    }
    fetchLatest();
  }, [activeCategory]);

  const handleSurpriseMe = () => {
    // If trending is loaded, pick one from there, otherwise fallback
    if (trendingPapers.length > 0) {
        const random = trendingPapers[Math.floor(Math.random() * trendingPapers.length)];
        router.push(`/chat/${random.id}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 pb-20">
      
      {/* HERO HEADER */}
      <div className="bg-white border-b border-slate-200 px-6 py-12 md:py-16 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                <span>Discover what's next</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
                Explore the frontiers of AI
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                Stay updated with trending research from Hugging Face and fresh preprints from ArXiv.
            </p>
            
            <div className="flex justify-center gap-3 pt-4">
                <Button onClick={() => document.getElementById('latest')?.scrollIntoView({ behavior: 'smooth'})} size="lg" className="bg-slate-900 text-white hover:bg-emerald-600">
                    Browse Latest
                </Button>
                <Button onClick={handleSurpriseMe} size="lg" variant="outline" className="bg-white">
                    <Dice5 className="mr-2 h-5 w-5 text-emerald-600" />
                    Surprise Me
                </Button>
            </div>
        </div>
      </div>

      <div className="w-full max-w-6xl mx-auto px-6 space-y-16 mt-12">
        
        {/* TRENDING SECTION (Sourced from Hugging Face) */}
        <section className="space-y-6">
            <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-100 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-orange-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Trending on Hugging Face</h2>
            </div>
            
            {loadingTrending ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1,2,3,4].map(i => (
                        <div key={i} className="h-40 rounded-xl bg-slate-200 animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {trendingPapers.map((paper) => (
                        <PaperCard key={paper.id} paper={paper} />
                    ))}
                    {trendingPapers.length === 0 && (
                        <div className="text-slate-500 col-span-2 text-center py-8">
                            No trending papers found right now.
                        </div>
                    )}
                </div>
            )}
        </section>

        {/* LATEST PREPRINTS (ArXiv) */}
        <section id="latest" className="space-y-6 scroll-mt-24">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Fresh from ArXiv</h2>
                </div>
                
                <Tabs defaultValue="cs.AI" onValueChange={setActiveCategory} className="w-auto">
                    <TabsList className="bg-white border border-slate-200 p-1 h-auto">
                        <TabsTrigger value="cs.AI" className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-900">General AI</TabsTrigger>
                        <TabsTrigger value="cs.CV" className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-900">Computer Vision</TabsTrigger>
                        <TabsTrigger value="cs.CL" className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-900">NLP</TabsTrigger>
                        <TabsTrigger value="cs.LG" className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-900">Machine Learning</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {loadingLatest ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1,2,3,4].map(i => (
                        <div key={i} className="h-48 rounded-xl bg-slate-200 animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {latestPapers.map((paper) => (
                        <PaperCard key={paper.id} paper={paper} />
                    ))}
                </div>
            )}
             
            <div className="flex justify-center">
                <Button variant="ghost" onClick={() => router.push(`/search?category=${activeCategory}&sortBy=submittedDate`)} className="text-slate-600 hover:text-emerald-600">
                    View more recent uploads <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
            </div>
        </section>

      </div>
    </div>
  );
}