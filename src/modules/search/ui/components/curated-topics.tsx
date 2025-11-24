"use client";

import { useState } from "react";
import { CURATED_PAPERS, CURATED_TOPICS, CuratedCategory } from "@/lib/curated-papers";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { PaperCard } from "./paper-card"; // Import the shared card

export function CuratedTopics() {
  const [selectedTopic, setSelectedTopic] = useState<CuratedCategory>("Transformers");

  return (
    <div className="w-full max-w-4xl space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold text-slate-900">Hall of Fame</h2>
        <p className="text-muted-foreground text-sm">
            Essential reading for AI researchers, curated by impact.
        </p>
      </div>

      {/* TOPIC TABS */}
      <ScrollArea className="w-full whitespace-nowrap pb-2">
        <div className="flex w-max space-x-2">
          {CURATED_TOPICS.map((topic) => (
            <Button
              key={topic}
              variant={selectedTopic === topic ? "default" : "outline"}
              onClick={() => setSelectedTopic(topic)}
              className={cn(
                "rounded-full px-6 transition-all border-slate-200",
                selectedTopic === topic 
                  ? "bg-slate-900 text-white hover:bg-slate-800 border-transparent shadow-md" 
                  : "bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300"
              )}
            >
              {topic}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>

      {/* PAPER LIST - Now using PaperCard */}
      <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
        {CURATED_PAPERS[selectedTopic].map((paper) => (
          <PaperCard key={paper.id} paper={paper} />
        ))}
      </div>
    </div>
  );
}