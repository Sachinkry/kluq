"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"

interface UrlInputSectionProps {
  urlInput: string
  onUrlInputChange: (value: string) => void
  onAddUrl: () => void
}

export const UrlInputSection = ({ 
  urlInput, 
  onUrlInputChange, 
  onAddUrl 
}: UrlInputSectionProps) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          YouTube URL
        </label>
        <div className="flex space-x-3 mt-2">
          <Input
            type="url"
            value={urlInput}
            onChange={(e) => onUrlInputChange(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            className="flex-1"
          />
          <Button
            onClick={onAddUrl}
            disabled={!urlInput.trim()}
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add
          </Button>
        </div>
      </div>
    </div>
  )
} 