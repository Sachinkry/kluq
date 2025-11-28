"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
    Search, 
    Share2, 
    Calendar, 
    Users, 
    ExternalLink, 
    MessageSquare, 
    Network,
    Quote,
    FileText,
    Hash,
    Library,
    BookOpen,
    ArrowRight
} from "lucide-react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { CitationGraph } from "@/modules/graph/ui/components/citation-graph";
import { CURATED_PAPERS } from "@/lib/curated-papers";

// ----------------------------------------------------------------------
// SUB-COMPONENT: LANDING VIEW (Matches your screenshot)
// ----------------------------------------------------------------------
function GraphLanding({ onSearch }: { onSearch: (term: string) => void }) {
  const [input, setInput] = useState("");
  const examplePapers = CURATED_PAPERS["Transformers"].slice(0, 3); // Use real data for examples

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) onSearch(input);
  };

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-4rem)] bg-white animate-in fade-in duration-500">
      
      {/* 1. HERO SECTION */}
      <div className="w-full max-w-3xl px-6 mt-20 md:mt-32 text-center space-y-8">
        <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
            Explore connected papers in a visual graph
            </h1>
            <p className="text-xl text-slate-500 font-light">
            To start, enter a paper identifier
            </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSubmit} className="relative max-w-2xl mx-auto w-full">
            <div className="relative flex items-center shadow-lg rounded-full transition-shadow hover:shadow-xl ring-1 ring-slate-200">
                <Input 
                    placeholder="Search by keywords, paper title, DOI or another identifier" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="h-14 pl-6 pr-32 rounded-full border-none text-lg bg-white focus-visible:ring-0 shadow-none"
                />
                <div className="absolute right-1.5">
                    <Button 
                        type="submit" 
                        size="lg" 
                        className="rounded-full bg-slate-900 hover:bg-emerald-600 text-white h-11 px-6 font-medium transition-colors"
                    >
                        Build a graph
                    </Button>
                </div>
            </div>
        </form>

        {/* Icons / Hints */}
        <div className="pt-8 pb-12">
            <p className="text-sm text-slate-400 mb-6">You can try:</p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-12">
                {[
                    { icon: Hash, label: "Paper DOI" },
                    { icon: FileText, label: "Paper Title" },
                    { icon: BookOpen, label: "Semantic Scholar" },
                    { icon: Library, label: "PubMed" },
                ].map((item) => (
                    <div key={item.label} className="flex flex-col items-center gap-2 group cursor-default">
                        <div className="p-3 bg-slate-50 rounded-full group-hover:bg-slate-100 transition-colors">
                            <item.icon className="w-6 h-6 text-slate-400 group-hover:text-slate-600" />
                        </div>
                        <span className="text-xs font-medium text-slate-500">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>

        <Separator className="max-w-xl mx-auto" />

        {/* 2. EXAMPLE GRAPHS */}
        <div className="pt-12 pb-20">
            <h3 className="text-lg font-medium text-slate-900 mb-8">
                Or start with one of our example graphs
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                {examplePapers.map((paper) => (
                    <div 
                        key={paper.id}
                        onClick={() => onSearch(paper.id)}
                        className="group relative bg-white border border-slate-200 rounded-xl p-5 hover:border-emerald-500/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between h-40"
                    >
                        <div>
                            <h4 className="font-semibold text-slate-900 line-clamp-2 leading-snug group-hover:text-emerald-700 transition-colors">
                                {paper.title}
                            </h4>
                            <p className="text-sm text-slate-500 mt-2">{paper.authors}</p>
                        </div>
                        <div className="flex items-center text-xs font-medium text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">
                            View Graph <ArrowRight className="w-3 h-3 ml-1" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}


// ----------------------------------------------------------------------
// MAIN CONTROLLER
// ----------------------------------------------------------------------

export default function GraphView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // URL State
  // NOTE: We remove the default ID so we can show the Landing Page by default
  const paperIdParam = searchParams.get("paperId");
  
  const [query, setQuery] = useState(paperIdParam || "");
  const [activePaperId, setActivePaperId] = useState<string | null>(paperIdParam);
  const [selectedNode, setSelectedNode] = useState<any>(null);

  // Sync state with URL changes (e.g. browser back button)
  useEffect(() => {
    const id = searchParams.get("paperId");
    setActivePaperId(id);
    if (id) setQuery(id);
    else setSelectedNode(null); // Clear selection if going back to landing
  }, [searchParams]);

  const handleVisualize = (inputVal: string) => {
    // Basic cleanup of ArXiv URLs if pasted directly
    const cleanId = inputVal.replace(/http:\/\/arxiv\.org\/abs\//g, "")
                            .replace(/https:\/\/arxiv\.org\/abs\//g, "")
                            .replace("v1", "")
                            .trim();
    
    // Update URL to trigger the view change
    router.push(`/graph?paperId=${cleanId}`);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleVisualize(query);
  };

  // --------------------------------------------------------------------
  // RENDER: LANDING STATE
  // --------------------------------------------------------------------
  if (!activePaperId) {
    return <GraphLanding onSearch={handleVisualize} />;
  }

  // --------------------------------------------------------------------
  // RENDER: ACTIVE GRAPH STATE (Split View)
  // --------------------------------------------------------------------
  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] w-full bg-slate-50 overflow-hidden">
      
      {/* Top Bar (Mini Search) */}
      <div className="h-14 border-b border-slate-200 bg-white px-4 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/graph")}>
            <Network className="w-5 h-5 text-emerald-600" />
            <h1 className="font-semibold text-slate-900 hidden md:block">Connected Papers</h1>
        </div>
        
        <form onSubmit={handleFormSubmit} className="flex gap-2 w-full max-w-md">
            <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input 
                    placeholder="Enter ArXiv ID..." 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-9 h-9 bg-slate-50 border-slate-200 focus-visible:ring-emerald-500"
                />
            </div>
            <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 h-9">
                Visualize
            </Button>
        </form>
      </div>

      {/* Split Pane Layout */}
      <ResizablePanelGroup direction="horizontal" className="flex-1 h-full">
        
        {/* LEFT: DETAILS PANEL */}
        <ResizablePanel defaultSize={25} minSize={20} maxSize={40} className="bg-white border-r border-slate-200 z-10 shadow-xl">
            <ScrollArea className="h-full">
                <div className="p-6 flex flex-col gap-6">
                    {!selectedNode ? (
                        <div className="text-center py-10 text-slate-400">
                            <Network className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>Select a node to view details</p>
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-left-4 duration-300 space-y-6">
                            
                            {/* Header Info */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-start">
                                    <Badge variant="outline" className="font-mono text-xs text-slate-500 border-slate-200">
                                        {selectedNode.group === "root" ? "Origin Paper" : selectedNode.group === "citation" ? "Citation" : "Reference"}
                                    </Badge>
                                    <Badge className={selectedNode.group === "root" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : "bg-slate-100 text-slate-700 hover:bg-slate-100"}>
                                        {selectedNode.year || "N/A"}
                                    </Badge>
                                </div>
                                
                                <h2 className="text-xl font-bold text-slate-900 leading-snug">
                                    {selectedNode.title}
                                </h2>

                                <div className="flex flex-col gap-2 text-sm text-slate-600">
                                    <span className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-slate-400" />
                                        {selectedNode.authors || "Unknown"}
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <Quote className="w-4 h-4 text-slate-400" />
                                        {selectedNode.citationCount || 0} Citations
                                    </span>
                                </div>
                            </div>

                            <Separator />

                            {/* Actions */}
                            <div className="grid grid-cols-2 gap-2">
                                <Button 
                                    onClick={() => handleVisualize(selectedNode.id)} 
                                    variant="outline" 
                                    className="w-full justify-start text-slate-700"
                                >
                                    <Network className="w-4 h-4 mr-2" />
                                    Graph Origin
                                </Button>
                                <Button 
                                    onClick={() => window.open(`https://arxiv.org/abs/${selectedNode.id}`, '_blank')} 
                                    variant="outline" 
                                    className="w-full justify-start text-slate-700"
                                >
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Read PDF
                                </Button>
                                <Button 
                                    onClick={() => router.push(`/search?q=${selectedNode.id}`)} 
                                    className="w-full col-span-2 bg-slate-900 hover:bg-emerald-600 text-white"
                                >
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                    Chat with Paper
                                </Button>
                            </div>

                            {/* Abstract */}
                            <div className="space-y-2">
                                <h3 className="font-semibold text-slate-900 text-sm">Abstract</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    {selectedNode.abstract || "No abstract available for this paper within the graph view. Click 'Chat with Paper' to analyze full content."}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* RIGHT: GRAPH AREA */}
        <ResizablePanel defaultSize={75} className="bg-slate-50 relative">
            <div className="w-full h-full bg-red-500">

                <CitationGraph 
                    paperId={activePaperId} 
                    onNodeSelect={setSelectedNode} 
                    selectedNodeId={selectedNode?.id}
                    />
            </div>
        </ResizablePanel>

      </ResizablePanelGroup>
    </div>
  );
}