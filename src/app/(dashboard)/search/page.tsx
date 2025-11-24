"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SearchIcon, Filter, ArrowUpDown } from "lucide-react"
import { PaperCard } from "@/modules/search/ui/components/paper-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// IMPORT THE NEW MODULE
import { CuratedTopics } from "@/modules/search/ui/components/curated-topics"
import SearchView from "@/modules/search/ui/views/search-view"

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

export default function SearchPage(){
  return <SearchView />;
}