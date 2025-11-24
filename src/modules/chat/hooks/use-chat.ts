import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useHeader } from "@/modules/dashboard/context/header-context";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export function useChat(pdfIdParam: string | string[] | undefined) {
  const router = useRouter();
  const { setTitle } = useHeader();
  
  // State
  const [pdfId, setPdfId] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfTitle, setPdfTitle] = useState<string>("");
  const [pdfSummary, setPdfSummary] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom helper
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Cleanup: Remove title when unmounting
  useEffect(() => {
    return () => setTitle(null);
  }, [setTitle]);

  // Load History Helper
  const fetchHistory = async (paperId: string) => {
    try {
      const res = await fetch(`/api/chat/history?paperId=${paperId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.messages && Array.isArray(data.messages)) {
            setMessages(data.messages.map((m: any) => ({
                role: m.role,
                content: m.content
            })));
        }
      }
    } catch (err) {
      console.error("Failed to fetch history", err);
    }
  };

  // Initial Load Logic (PDF + Metadata)
  useEffect(() => {
    async function load() {
      if (!pdfIdParam) return;
      
      try {
        const idString = Array.isArray(pdfIdParam) ? pdfIdParam[0] : pdfIdParam;
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idString);
        
        let activePdfId = idString;

        if (isUUID) {
          // CASE 1: Direct UUID Load (Refresh or Direct Link)
          setPdfId(idString);
          setPdfUrl(`/api/pdf/serve?pdfId=${idString}`);
          
          const res = await fetch(`/api/pdf/info?pdfId=${idString}`);
          if (res.ok) {
            const data = await res.json();
            const title = data.title || "Document";
            
            setPdfTitle(title);
            setPdfSummary(data.summary || "");
            setTitle(title); // <--- Update Global Header
          }
        } else {
           // CASE 2: ArXiv ID Load (From Search)
           const res = await fetch("/api/pdf/load", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ arxivId: idString }),
          });
          
          if (res.ok) {
            const data = await res.json();
            activePdfId = data.pdfId;
            
            setPdfId(data.pdfId);
            setPdfUrl(`/api/pdf/serve?pdfId=${data.pdfId}`);
            
            if (data.title) {
                setPdfTitle(data.title);
                setTitle(data.title); // <--- Update Global Header
            }
            
            // Fetch fresh summary (since load endpoint might not return full details)
            const infoRes = await fetch(`/api/pdf/info?pdfId=${data.pdfId}`);
             if (infoRes.ok) {
                const infoData = await infoRes.json();
                setPdfSummary(infoData.summary || ""); 
             }
             
            // Update URL to UUID without reloading page
            router.replace(`/chat/${data.pdfId}`);
          }
        }

        // Load Chat History for this paper
        if (activePdfId) {
            await fetchHistory(activePdfId);
        }

      } catch (error) {
        console.error("Error loading PDF:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [pdfIdParam, router, setTitle]);

  // Handle Chat Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !pdfId || isStreaming) return;

    const userMessage = input.trim();
    setInput("");
    setIsStreaming(true);

    // Optimistic Update
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

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

      if (!response.ok) throw new Error(`Chat failed: ${response.statusText}`);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          // Raw text streaming fix
          const chunk = decoder.decode(value, { stream: true });
          assistantMessage += chunk;
          
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
      setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { role: "assistant", content: "Error: Could not fetch response." };
          return newMessages;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  return {
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
  };
}