import ReactMarkdown from "react-markdown";
import { Loader2 } from "lucide-react";
import { ChatMessage } from "../../hooks/use-chat";
import { cn } from "@/lib/utils";

interface MessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  isEmpty: boolean;
}

export const MessageList = ({ messages, isLoading, isEmpty }: MessageListProps) => {
  if (isEmpty) {
    return (
      <div className="flex items-center justify-center h-full text-center">
        <div className="text-slate-500">
          <p className="text-lg font-medium mb-2">Start a conversation</p>
          <p className="text-sm">Ask questions about the PDF document</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((m, idx) => (
        <div key={idx} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
          <div className={cn(
            "max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm",
            m.role === "user" 
              ? "bg-emerald-600 text-white rounded-br-none" 
              : "bg-white text-slate-900 border border-slate-100 rounded-bl-none"
          )}>
            <ReactMarkdown components={{
                strong: ({node, ...props}) => <span className="font-semibold text-emerald-800" {...props} />,
                p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                li: ({node, ...props}) => <li className="pl-1" {...props} />
            }}>
              {m.content}
            </ReactMarkdown>
          </div>
        </div>
      ))}

      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-white text-slate-900 border border-slate-100 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
          </div>
        </div>
      )}
    </div>
  );
};