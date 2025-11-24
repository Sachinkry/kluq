"use client";

import { Loader2 } from "lucide-react";

interface PDFViewerProps {
  url: string | null;
  loading: boolean;
}

export const PDFViewer = ({ url, loading }: PDFViewerProps) => {
  return (
    <div className="  overflow-hidden flex flex-col h-full bg-slate-100">
      <div className="flex-1 min-h-0 overflow-hidden relative">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : url ? (
          // The <object> tag uses the browser's native PDF viewer
          // ensuring 100% fidelity and zero JS crashes.
          <object
            data={url}
            type="application/pdf"
            className="w-full h-full block"
          >
            {/* Fallback for browsers that don't support PDF embedding */}
            <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2">
              <p>Unable to display PDF directly.</p>
              <a 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-emerald-600 hover:underline font-medium"
              >
                Download to view
              </a>
            </div>
          </object>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400 text-sm">
            Select a document to view
          </div>
        )}
      </div>
    </div>
  );
};