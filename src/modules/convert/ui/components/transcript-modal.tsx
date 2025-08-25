"use client"

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  Copy, 
  Download, 
  CheckCircle, 
  XCircle, 
  Clock,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

interface TranscriptionResult {
  id: string;
  status: 'queued' | 'processing' | 'completed' | 'error';
  text?: string;
  error?: string;
  confidence?: number;
  words?: Array<{
    text: string;
    start: number;
    end: number;
    confidence: number;
  }>;
}

interface TranscriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversionId: string;
  conversionName: string;
  conversionType: 'url' | 'file';
}

export const TranscriptModal = ({ 
  isOpen, 
  onClose, 
  conversionId, 
  conversionName, 
  conversionType 
}: TranscriptModalProps) => {
  const [transcript, setTranscript] = useState<TranscriptionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fetch transcript when modal opens
  useEffect(() => {
    if (isOpen && conversionId) {
      fetchTranscript();
    }
  }, [isOpen, conversionId]);

  const fetchTranscript = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/transcribe?id=${conversionId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch transcript');
      }
      const data = await response.json();
      setTranscript(data);
    } catch (error) {
      console.error('Error fetching transcript:', error);
      toast.error('Failed to load transcript');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!transcript?.text) return;
    
    try {
      await navigator.clipboard.writeText(transcript.text);
      setCopied(true);
      toast.success('Transcript copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy transcript');
    }
  };

  const downloadTranscript = () => {
    if (!transcript?.text) return;
    
    const blob = new Blob([transcript.text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${conversionName}-transcript.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Transcript downloaded');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'queued': return <Clock className="w-4 h-4 text-muted-foreground" />;
      case 'processing': return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'queued': return 'Queued';
      case 'processing': return 'Processing';
      case 'completed': return 'Completed';
      case 'error': return 'Error';
      default: return '';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Transcript: {conversionName}
          </DialogTitle>
          <DialogDescription>
            {conversionType === 'url' ? 'YouTube video transcription' : 'File transcription'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status and Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {transcript && getStatusIcon(transcript.status)}
              <span className="text-sm font-medium">
                {transcript ? getStatusText(transcript.status) : 'Loading...'}
              </span>
              {transcript?.confidence && (
                <Badge variant="secondary">
                  {Math.round(transcript.confidence * 100)}% confidence
                </Badge>
              )}
            </div>
            
            {transcript?.status === 'completed' && transcript.text && (
              <div className="flex items-center gap-2">
                <Button
                  onClick={copyToClipboard}
                  size="sm"
                  variant="outline"
                  disabled={copied}
                >
                  <Copy className="w-4 h-4 mr-1" />
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
                <Button
                  onClick={downloadTranscript}
                  size="sm"
                  variant="outline"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
              </div>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="ml-2">Loading transcript...</span>
            </div>
          )}

          {/* Error State */}
          {transcript?.status === 'error' && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">Transcription failed</p>
              <p className="text-red-600 text-sm mt-1">
                {transcript.error || 'An error occurred during transcription'}
              </p>
            </div>
          )}

          {/* Processing State */}
          {transcript?.status === 'processing' && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Transcribing audio... This may take a few minutes.
              </p>
              <Progress value={50} className="h-2" />
            </div>
          )}

          {/* Completed Transcript */}
          {transcript?.status === 'completed' && transcript.text && (
            <div className="space-y-4">
              {/* Word-level transcript with timestamps */}
              {transcript.words && transcript.words.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Detailed Transcript</h4>
                  <ScrollArea className="h-64 border rounded-lg p-4">
                    <div className="space-y-1">
                      {transcript.words.map((word, index) => (
                        <span
                          key={index}
                          className="inline-block mr-2 mb-1 text-sm"
                          title={`${formatTime(word.start)} - ${formatTime(word.end)} (${Math.round(word.confidence * 100)}% confidence)`}
                        >
                          <span className="text-xs text-muted-foreground mr-1">
                            {formatTime(word.start)}
                          </span>
                          <span className={word.confidence < 0.8 ? 'text-orange-600' : ''}>
                            {word.text}
                          </span>
                        </span>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {/* Full text transcript */}
              <div className="space-y-2">
                <h4 className="font-medium">Full Transcript</h4>
                <ScrollArea className="h-48 border rounded-lg p-4">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {transcript.text}
                  </p>
                </ScrollArea>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}; 