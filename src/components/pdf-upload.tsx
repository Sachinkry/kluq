"use client";

import { Upload, FileText, X } from 'lucide-react';
import { useState } from 'react';

interface PDFUploadProps {
  onPDFSelect: (file: File) => void;
  loading?: boolean;
}

export default function PDFUpload({ onPDFSelect, loading = false }: PDFUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
        onPDFSelect(file);
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
        onPDFSelect(file);
      }
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="w-full max-w-2xl px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            Chat with PDF
          </h1>
          <p className="text-lg text-slate-600">
            Upload a PDF document to start chatting with it
          </p>
        </div>

        {selectedFile ? (
          <div className="border-2 border-emerald-500 rounded-2xl p-8 bg-emerald-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{selectedFile.name}</p>
                  <p className="text-sm text-slate-600">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              {!loading && (
                <button
                  onClick={handleRemove}
                  className="p-2 hover:bg-emerald-200 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              )}
            </div>
            {loading && (
              <div className="mt-4">
                <div className="w-full bg-emerald-200 rounded-full h-2">
                  <div className="bg-emerald-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                </div>
                <p className="text-sm text-emerald-700 mt-2 text-center">
                  Processing PDF...
                </p>
              </div>
            )}
          </div>
        ) : (
          <div
            className={`relative border-2 border-dashed rounded-2xl p-12 transition-all ${
              dragActive
                ? 'border-emerald-500 bg-emerald-50'
                : 'border-slate-300 hover:border-slate-400 bg-white'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={loading}
            />
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <Upload className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Drop your PDF here
              </h3>
              <p className="text-slate-600 mb-4">
                or click to browse from your computer
              </p>
              <p className="text-sm text-slate-500">
                Supports PDF files up to 10MB
              </p>
            </div>
          </div>
        )}

        <div className="mt-8 text-center text-sm text-slate-500">
          Your documents are processed securely and never shared
        </div>
      </div>
    </div>
  );
}

