"use client"

import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"
import { useRef } from "react"

interface FileUploadSectionProps {
  isDragging: boolean
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: () => void
  onDrop: (e: React.DragEvent) => void
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export const FileUploadSection = ({ 
  isDragging, 
  onDragOver, 
  onDragLeave, 
  onDrop, 
  onFileSelect 
}: FileUploadSectionProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
        isDragging 
          ? 'border-primary bg-primary/5' 
          : 'border-muted-foreground/25 hover:border-muted-foreground/50'
      }`}
    >
      <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
      <p className="text-lg font-medium mb-2">
        Drop files here or click to upload
      </p>
      <p className="text-sm text-muted-foreground mb-4">
        Supports videos, documents, and note files
      </p>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={onFileSelect}
        className="hidden"
        accept=".pdf,.doc,.docx,.txt,.mp4,.avi,.mov,.mp3,.wav"
      />
      <Button
        onClick={() => fileInputRef.current?.click()}
        variant="outline"
      >
        Choose Files
      </Button>
    </div>
  )
} 