"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2 } from "lucide-react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatWithPaperPage() {
  const { id } = useParams();
  const [pdfId, setPdfId] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfTitle, setPdfTitle] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !pdfId || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);

    // Add user message
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

    try {
      const response = await fetch("/api/pdf/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pdfId: pdfId,
          messages: [
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: "user" as const, content: userMessage },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      // Handle streaming response (Vercel AI SDK format)
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";
      let buffer = "";

      // Add empty assistant message
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || ""; // Keep incomplete line in buffer

          for (const line of lines) {
            if (line.trim() === "") continue;
            
            // Vercel AI SDK streaming format: "0:content" or "0:"content"
            if (line.match(/^\d+:/)) {
              const text = line.substring(line.indexOf(":") + 1);
              assistantMessage += text;
              setMessages((prev) => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = {
                  role: "assistant",
                  content: assistantMessage,
                };
                return newMessages;
              });
            }
          }
        }
        
        // Process any remaining buffer
        if (buffer.trim()) {
          const text = buffer.replace(/^\d+:/, "");
          assistantMessage += text;
          setMessages((prev) => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = {
              role: "assistant",
              content: assistantMessage,
            };
            return newMessages;
          });
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    async function load() {
      try {
        // Check if it's a UUID (uploaded PDF) or arxiv ID
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id as string);
        
        if (isUUID) {
          // It's an uploaded PDF, serve directly
          setPdfId(id as string);
          setPdfUrl(`/api/pdf/serve?pdfId=${id}`);
          
          // Try to get title from database
          const res = await fetch(`/api/pdf/info?pdfId=${id}`);
          if (res.ok) {
            const data = await res.json();
            setPdfTitle(data.title || "Document");
          }
        } else {
          // It's an arxiv ID, load it
          const res = await fetch(`/api/pdf/load?arxivId=${id}`);
          if (!res.ok) {
            console.error("Failed to load PDF");
            setLoading(false);
            return;
          }
          const data = await res.json();
          setPdfId(data.pdfId);
          setPdfUrl(`/api/pdf/serve?pdfId=${data.pdfId}`);
        }
      } catch (error) {
        console.error("Error loading PDF:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="grid grid-cols-2 h-screen overflow-hidden bg-white">
      {/* LEFT - PDF Viewer */}
      <div className="border-r border-slate-200 overflow-hidden flex flex-col">
        <div className="border-b border-slate-200 px-4 py-3 bg-slate-50">
          <h2 className="font-semibold text-slate-900 truncate">
            {pdfTitle || "PDF Document"}
          </h2>
        </div>
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : pdfUrl ? (
            <iframe src={pdfUrl} className="w-full h-full" />
          ) : (
            <div className="p-4 text-slate-500">PDF not available</div>
          )}
        </div>
      </div>

      {/* RIGHT - Chat Interface */}
      <div className="flex flex-col h-full bg-white">
        <div className="border-b border-slate-200 px-4 py-3 bg-slate-50">
          <h2 className="font-semibold text-slate-900">Chat</h2>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full text-center">
              <div className="text-slate-500">
                <p className="text-lg font-medium mb-2">Start a conversation</p>
                <p className="text-sm">
                  Ask questions about the PDF document
                </p>
              </div>
            </div>
          )}
          
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  m.role === "user"
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-900"
                }`}
              >
                <div className="whitespace-pre-wrap">{m.content}</div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 text-slate-900 rounded-lg px-4 py-2">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-slate-200 p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              placeholder="Ask anything about the document..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading || !pdfId}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={isLoading || !pdfId || !input.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
