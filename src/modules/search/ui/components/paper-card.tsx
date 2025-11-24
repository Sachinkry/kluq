"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Loader2, Calendar, ExternalLink, ChevronDown, ChevronUp, BotIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export interface Paper {
  id: string;
  title: string;
  authors: string;
  published: string;
  abstract: string;
  pdfUrl: string;
  categories: string[];
}

export function PaperCard({ paper }: { paper: Paper }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false); // State for See More/Less

  const handleChatClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setIsLoading(true);
      
      const res = await fetch("/api/pdf/load", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ arxivId: paper.id }),
      });

      if (!res.ok) throw new Error("Failed to load paper");
      const data = await res.json();
      router.push(`/chat/${data.pdfId}`);
      
    } catch (error) {
      console.error("Error loading paper:", error);
      setIsLoading(false); 
    }
  };

  const formattedDate = isNaN(new Date(paper.published).getTime()) 
    ? paper.published 
    : format(new Date(paper.published), "MMM d, yyyy");

  return (
    <div className="group border border-slate-200 rounded-xl p-5 hover:shadow-md transition-all bg-white hover:border-emerald-200/50 flex flex-col gap-4">
      
      {/* TOP ROW: Metadata & Actions */}
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
             <Badge variant="outline" className="bg-slate-50 text-slate-600 font-mono text-[10px] py-0 h-5">
                {paper.id}
             </Badge>
             <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formattedDate}
             </span>
             {paper.categories.slice(0, 3).map(cat => (
                 <span key={cat} className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-medium text-slate-600">
                    {cat}
                 </span>
             ))}
          </div>

          <h3 className="text-lg font-bold text-slate-900 leading-tight group-hover:text-emerald-700 transition-colors">
            <a href={`https://arxiv.org/abs/${paper.id}`} target="_blank" rel="noreferrer">
                {paper.title}
            </a>
          </h3>
          
          <p className="text-sm font-medium text-slate-600 line-clamp-1">
            {paper.authors}
          </p>
        </div>

        <div className="flex flex-col gap-2 shrink-0">
            <Button 
            size="sm" 
            onClick={handleChatClick} 
            disabled={isLoading}
            className="bg-slate-900 text-white hover:bg-emerald-600 hover:cursor-pointer transition-colors shadow-none h-9 px-4"
            >
            {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                // <MessageSquare className="mr-2 h-4 w-4" />
                <BotIcon className="mr-1 size-5" />
            )}
            {isLoading ? "..." : "Chat"}
            </Button>
        </div>
      </div>

      {/* BOTTOM: Abstract with "See More" */}
      <div className="relative">
        <p 
            className={cn(
                "text-slate-600 text-sm leading-relaxed transition-all",
                !isExpanded && "line-clamp-5" // Truncate if not expanded
            )}
        >
            {paper.abstract}
        </p>
        
        <div className="flex items-center justify-between mt-2">
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                }}
                className="text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors focus:outline-none"
            >
                {isExpanded ? (
                    <>See Less <ChevronUp className="h-3 w-3" /></>
                ) : (
                    <>See More <ChevronDown className="h-3 w-3" /></>
                )}
            </button>

            {/* PDF Link */}
            <a href={paper.pdfUrl} target="_blank" className="text-xs font-medium text-slate-400 hover:text-emerald-600 flex items-center gap-1 transition-colors">
                <ExternalLink className="h-3 w-3" />
                Original PDF
            </a>
        </div>
      </div>
    </div>
  );
}