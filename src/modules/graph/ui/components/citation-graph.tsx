"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { Loader2, ZoomIn, ZoomOut, RefreshCcw, AlertCircle, MousePointer2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="animate-spin text-emerald-600" />
    </div>
  ),
});

interface GraphNode {
  id: string;
  title: string;
  year: number;
  group: "root" | "citation" | "reference";
  val: number;
  x?: number;
  y?: number;
  [key: string]: any;
}

interface CitationGraphProps {
  paperId: string;
  onNodeSelect?: (node: GraphNode | null) => void;
  selectedNodeId?: string | null;
}

export function CitationGraph({ paperId, onNodeSelect, selectedNodeId }: CitationGraphProps) {
  const [data, setData] = useState<any>({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const graphRef = useRef<any>(null);
  const hasZoomed = useRef(false);
  const { theme } = useTheme();

  // Load Data
  useEffect(() => {
    if (!paperId) return;

    setLoading(true);
    hasZoomed.current = false;

    fetch(`/api/graph?paperId=${paperId}`)
      .then((res) => res.json())
      .then((res) => {
        setData(res);
        const root = res.nodes.find((n: any) => n.group === "root");
        if (root && onNodeSelect) onNodeSelect(root);
      })
      .catch((err) => console.error("Graph fetch error:", err))
      .finally(() => setLoading(false));
  }, [paperId]);

  // --- FIX: APPLY FORCES VIA EFFECT INSTEAD OF PROP ---
  useEffect(() => {
    if (graphRef.current) {
        // Stronger repulsion to prevent clustering in center
        graphRef.current.d3Force('charge').strength(-100);
        // Longer links for better spread
        graphRef.current.d3Force('link').distance(70);
    }
  }, [data]); // Run whenever data updates (graph re-renders)
  // ----------------------------------------------------

  const handleEngineStop = () => {
    if (!hasZoomed.current && graphRef.current) {
      hasZoomed.current = true;
      graphRef.current.zoomToFit(400, 50);
    }
  };

  const getNodeColor = (year: number, minYear: number, maxYear: number) => {
    const ratio = Math.max(0, Math.min(1, (year - minYear) / (maxYear - minYear || 1)));
    const r = Math.round(51 + (52 - 51) * ratio);
    const g = Math.round(65 + (211 - 65) * ratio);
    const b = Math.round(85 + (153 - 85) * ratio);
    return `rgb(${r}, ${g}, ${b})`;
  };

  const paintNode = useCallback(
    (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const isSelected = node.id === selectedNodeId;
      const isRoot = node.group === "root";
      const fontSize = 12 / globalScale;

      const years = data.nodes.map((n: any) => n.year);
      const minYear = Math.min(...years);
      const maxYear = Math.max(...years);

      const fill = getNodeColor(node.year, minYear, maxYear);
      
      let stroke = isRoot ? "#000" : "#fff"; 
      let lineWidth = isRoot ? 2 / globalScale : 1 / globalScale;
      
      if (isSelected) {
        stroke = "#10b981";
        lineWidth = 3 / globalScale;
      }

      const radius = Math.sqrt(node.val) * 3;
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
      ctx.fillStyle = fill;
      ctx.fill();
      
      ctx.strokeStyle = stroke;
      ctx.lineWidth = lineWidth;
      ctx.stroke();

      if (isSelected || isRoot || globalScale > 2.5) {
        ctx.font = `600 ${fontSize}px Sans-Serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = theme === 'dark' ? "#fff" : "#1e293b";
        
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2 / globalScale;
        ctx.strokeText(node.title, node.x, node.y + radius + fontSize + 2);
        
        ctx.fillText(node.title, node.x, node.y + radius + fontSize + 2);
      }
    },
    [selectedNodeId, theme, data]
  );

  return (
    <div className="relative w-full h-full bg-slate-50 overflow-hidden">
      {loading ? (
        <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <span className="text-sm font-medium">Building similarity graph...</span>
        </div>
      ) : data.nodes.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
          <AlertCircle className="w-10 h-10 opacity-20" />
          <span>No citation data found.</span>
        </div>
      ) : (
        <ForceGraph2D
          ref={graphRef}
          graphData={data}
          nodeLabel="title"
          nodeCanvasObject={paintNode}
          onNodeClick={(node) => onNodeSelect && onNodeSelect(node as GraphNode)}
          onEngineStop={handleEngineStop}
          d3AlphaDecay={0.01}
          d3VelocityDecay={0.4}
          cooldownTicks={200}
          linkColor={() => "#e2e8f0"}
          linkWidth={1}
          linkDirectionalArrowLength={0}
          backgroundColor="#f8fafc"
        />
      )}

      <div className="absolute bottom-6 right-6 z-10 flex flex-col gap-2 bg-white p-2 rounded-lg shadow-lg border border-slate-100">
        <Button variant="ghost" size="icon" onClick={() => graphRef.current?.zoom(2)}>
          <ZoomIn className="h-4 w-4 text-slate-600" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => graphRef.current?.zoom(0.5)}>
          <ZoomOut className="h-4 w-4 text-slate-600" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => graphRef.current?.zoomToFit(400, 50)}>
          <RefreshCcw className="h-4 w-4 text-slate-600" />
        </Button>
      </div>

      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur p-3 rounded-lg border border-slate-200 shadow-sm text-xs space-y-3 pointer-events-none min-w-[140px]">
         <div className="font-semibold text-slate-900 mb-1">Publish Date</div>
         <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[rgb(51,65,85)]"></div>
            <span className="text-slate-600">Older Papers</span>
         </div>
         <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[rgb(52,211,153)]"></div>
            <span className="text-slate-600">Newer Papers</span>
         </div>
         <div className="h-px bg-slate-100 my-2" />
         <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border-2 border-slate-900 bg-transparent"></div>
            <span className="text-slate-600">Origin Paper</span>
         </div>
         <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-slate-300"></div>
             <div className="w-4 h-4 rounded-full bg-slate-300 ml-[-4px]"></div>
             <span className="text-slate-600 ml-1">Size = Citations</span>
         </div>
      </div>
    </div>
  );
}