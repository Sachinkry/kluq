"use client"

import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { InputTypeSelector } from '../components/input-type-selector';
import { UrlInputSection } from '../components/url-input-section';
import { FileUploadSection } from '../components/file-upload-section';
import { ConversionQueue } from '../components/conversion-queue';
import { StatsCards } from '../components/stats-cards';
import { TranscriptModal } from '../components/transcript-modal';

interface ConversionItem {
  id: string;
  type: 'url' | 'file';
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  url?: string;
}

export const ConvertView = () => {
  const [inputType, setInputType] = useState<'url' | 'file'>('url');
  const [urlInput, setUrlInput] = useState('');
  const [conversions, setConversions] = useState<ConversionItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [transcriptModal, setTranscriptModal] = useState<{
    isOpen: boolean;
    conversionId: string;
    conversionName: string;
    conversionType: 'url' | 'file';
  }>({
    isOpen: false,
    conversionId: '',
    conversionName: '',
    conversionType: 'url'
  });
  
  // TODO: Get user's premium status from auth/context
  const isPremium = false; // This should come from user context

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    files.forEach((file, index) => {
      const newConversion: ConversionItem = {
        id: `file-${Date.now()}-${index}`,
        type: 'file',
        name: file.name,
        status: 'pending',
        progress: 0
      };
      setConversions(prev => [...prev, newConversion]);
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file, index) => {
      const newConversion: ConversionItem = {
        id: `file-${Date.now()}-${index}`,
        type: 'file',
        name: file.name,
        status: 'pending',
        progress: 0
      };
      setConversions(prev => [...prev, newConversion]);
    });
  };

  const addUrlConversion = () => {
    if (urlInput.trim()) {
      const newConversion: ConversionItem = {
        id: `url-${Date.now()}`,
        type: 'url',
        name: urlInput,
        status: 'pending',
        progress: 0,
        url: urlInput
      };
      setConversions(prev => [...prev, newConversion]);
      setUrlInput('');
    }
  };

  const startConversion = (id: string) => {
    // For free tier, only allow one conversion at a time
    if (!isPremium) {
      const hasProcessing = conversions.some(conv => conv.status === 'processing');
      if (hasProcessing) {
        return; // Don't start another conversion if one is already processing
      }
    }

    setConversions(prev => 
      prev.map(conv => 
        conv.id === id ? { ...conv, status: 'processing' as const, progress: 0 } : conv
      )
    );

    // Simulate conversion progress
    const interval = setInterval(() => {
      setConversions(prev => {
        const updated = prev.map(conv => {
          if (conv.id === id && conv.status === 'processing') {
            const newProgress = Math.min(conv.progress + Math.random() * 20, 100);
            if (newProgress >= 100) {
              clearInterval(interval);
              return { ...conv, status: 'completed' as const, progress: 100 };
            }
            return { ...conv, progress: newProgress };
          }
          return conv;
        });
        return updated;
      });
    }, 500);
  };

  const removeConversion = (id: string) => {
    setConversions(prev => prev.filter(conv => conv.id !== id));
  };

  const convertAll = () => {
    // Only allow convert all for premium users
    if (!isPremium) {
      return;
    }
    
    conversions.forEach(conv => {
      if (conv.status === 'pending') {
        startConversion(conv.id);
      }
    });
  };

  const handleViewTranscript = (id: string) => {
    const conversion = conversions.find(conv => conv.id === id);
    if (conversion) {
      setTranscriptModal({
        isOpen: true,
        conversionId: id,
        conversionName: conversion.name,
        conversionType: conversion.type
      });
    }
  };

  return (
    <div className="flex-1 p-6 bg-background">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Convert to PDF</h1>
          <p className="text-muted-foreground">
            Transform your lecture notes, videos, and URLs into organized PDF documents
          </p>
        </div>

        {/* Input Type Selection */}
        <InputTypeSelector
          inputType={inputType}
          onInputTypeChange={setInputType}
        />

        {/* Input Section */}
        <Card>
          <CardContent className="p-6">
            {inputType === 'url' ? (
              <UrlInputSection
                urlInput={urlInput}
                onUrlInputChange={setUrlInput}
                onAddUrl={addUrlConversion}
              />
            ) : (
              <FileUploadSection
                isDragging={isDragging}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onFileSelect={handleFileSelect}
              />
            )}
          </CardContent>
        </Card>

        {/* Conversion Queue */}
        <ConversionQueue
          conversions={conversions}
          onStartConversion={startConversion}
          onRemoveConversion={removeConversion}
          onConvertAll={convertAll}
          onViewTranscript={handleViewTranscript}
          isPremium={isPremium}
        />

        {/* Transcript Modal */}
        <TranscriptModal
          isOpen={transcriptModal.isOpen}
          onClose={() => setTranscriptModal(prev => ({ ...prev, isOpen: false }))}
          conversionId={transcriptModal.conversionId}
          conversionName={transcriptModal.conversionName}
          conversionType={transcriptModal.conversionType}
        />

        {/* Quick Stats */}
        <StatsCards />
      </div>
    </div>
  );
}; 