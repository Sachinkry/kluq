"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Link, Upload } from "lucide-react"

interface InputTypeSelectorProps {
  inputType: 'url' | 'file'
  onInputTypeChange: (type: 'url' | 'file') => void
}

export const InputTypeSelector = ({ 
  inputType, 
  onInputTypeChange 
}: InputTypeSelectorProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card 
        className={`cursor-pointer transition-all hover:shadow-md ${
          inputType === 'url' ? 'ring-2 ring-primary' : ''
        }`}
        onClick={() => onInputTypeChange('url')}
      >
        <CardContent className="p-6 text-center">
          <Link className="w-8 h-8 text-primary mx-auto mb-3" />
          <h3 className="font-semibold mb-1">YouTube URL</h3>
          <p className="text-sm text-muted-foreground">Convert video to PDF notes</p>
        </CardContent>
      </Card>
      
      <Card 
        className={`cursor-pointer transition-all hover:shadow-md ${
          inputType === 'file' ? 'ring-2 ring-primary' : ''
        }`}
        onClick={() => onInputTypeChange('file')}
      >
        <CardContent className="p-6 text-center">
          <Upload className="w-8 h-8 text-primary mx-auto mb-3" />
          <h3 className="font-semibold mb-1">Upload Files</h3>
          <p className="text-sm text-muted-foreground">Notes, videos, documents</p>
        </CardContent>
      </Card>
    </div>
  )
} 