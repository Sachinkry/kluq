// src/modules/research/ui/paper-card.tsx
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageSquare } from "lucide-react"
import Link from "next/link"

interface Paper {
  id: string
  title: string
  authors: string[]
  published: string
  abstract: string
  pdfUrl: string
  category: string
}

export function PaperCard({ paper }: { paper: Paper }) {
  return (
    <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow bg-card">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold mb-2 line-clamp-2">
            <a href={`https://arxiv.org/abs/${paper.id}`} target="_blank" className="hover:underline">
              {paper.title}
            </a>
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            {paper.authors.slice(0, 3).join(", ")}
            {paper.authors.length > 3 && " et al."} • {new Date(paper.published).toLocaleDateString()}
          </p>
          <Badge variant="secondary">{paper.category}</Badge>
        </div>

        <Button asChild size="sm">
          <Link href={`/chat/${paper.id}`}>
            <MessageSquare className="mr-2 h-4 w-4" />
            Chat with PDF
          </Link>
        </Button>
      </div>

      <p className="text-muted-foreground text-sm leading-relaxed line-clamp-4">
        {paper.abstract}
      </p>
    </div>
  )
}