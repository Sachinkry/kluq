"use client";

import { useParams } from "next/navigation";
import { useChat } from "@/modules/chat/hooks/use-chat";
import { PDFViewer } from "../components/pdf-viewer";
import { ResearchSummary } from "../components/research-summary";
import { MessageList } from "../components/message-list";
import { ChatInput } from "../components/chat-input";
// Import the resizable components
import { 
  ResizableHandle, 
  ResizablePanel, 
  ResizablePanelGroup 
} from "@/components/ui/resizable";

export const ChatView = () => {
  const { id } = useParams();
  
  const {
    pdfId,
    pdfUrl,
    pdfTitle,
    pdfSummary,
    loading,
    messages,
    input,
    setInput,
    isStreaming,
    handleSubmit,
    messagesEndRef
  } = useChat(id);

  return (
    <div className="h-screen w-full bg-red-500 overflow-hidden">
      <ResizablePanelGroup direction="horizontal" className="h-full w-full">
        
        {/* LEFT PANEL: PDF */}
        <ResizablePanel defaultSize={50} minSize={20}>
          <PDFViewer url={pdfUrl} loading={loading} />
        </ResizablePanel>

        {/* DRAGGABLE HANDLE */}
        <ResizableHandle withHandle />

        {/* RIGHT PANEL: CHAT */}
        <ResizablePanel defaultSize={50} minSize={30}>
          <div className="flex flex-col h-full bg-slate-50 min-h-0">
            {/* Header */}
            {/* <div className="border-b border-slate-200 px-4 py-3 bg-white shrink-0 shadow-sm">
              <h2 className="font-semibold text-slate-900 truncate">
                {loading ? "Loading..." : pdfTitle}
              </h2>
            </div> */}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 min-h-0 scroll-smooth">
              {!loading && <ResearchSummary summary={pdfSummary} />}
              
              <MessageList 
                messages={messages} 
                isLoading={isStreaming} 
                isEmpty={messages.length === 0 && !loading && !pdfSummary} 
              />
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <ChatInput 
              input={input}
              setInput={setInput}
              onSubmit={handleSubmit}
              loading={isStreaming}
              disabled={!pdfId}
            />
          </div>
        </ResizablePanel>

      </ResizablePanelGroup>
    </div>
  );
};