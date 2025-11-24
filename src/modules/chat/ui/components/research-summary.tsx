import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ResearchSummaryProps {
  summary: string;
}

export const ResearchSummary = ({ summary }: ResearchSummaryProps) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!summary) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full mb-4">
      <Card className="border-emerald-100 bg-emerald-50/50 shadow-sm">
        <CardHeader 
          className="py-3 px-4 flex flex-row items-center justify-between space-y-0 cursor-pointer" 
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-700" />
            <CardTitle className="text-sm font-semibold text-emerald-900">
              Research Overview
            </CardTitle>
          </div>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-emerald-100">
              {isOpen ? <ChevronUp className="h-4 w-4 text-emerald-700" /> : <ChevronDown className="h-4 w-4 text-emerald-700" />}
            </Button>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="px-4 pb-4 pt-0 text-sm text-slate-700 leading-relaxed">
            <ReactMarkdown 
              components={{
                strong: ({ node, ...props }) => <span className="font-semibold text-emerald-800" {...props} />,
                p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                li: ({ node, ...props }) => <li className="pl-1" {...props} />
              }}
            >
              {summary}
            </ReactMarkdown>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};