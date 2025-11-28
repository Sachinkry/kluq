"use client";

import { useState, useEffect } from "react"; // Import useEffect
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { CitationGraph } from "@/modules/graph/ui/components/citation-graph";
import { useSearchParams } from "next/navigation"; // Import useSearchParams
import GraphView from "@/modules/graph/ui/views/graph-view";

export default function GraphPage(){
    return <GraphView />;
}