import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  disabled: boolean;
}

export const ChatInput = ({ input, setInput, onSubmit, loading, disabled }: ChatInputProps) => {
  return (
    <div className="border-t border-slate-200 p-4 shrink-0 bg-white">
      <form onSubmit={onSubmit} className="flex gap-2">
        <Input
          placeholder="Ask a specific question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading || disabled}
          className="flex-1 border-slate-200 focus-visible:ring-emerald-500"
        />
        <Button 
          type="submit" 
          disabled={loading || disabled || !input.trim()} 
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </form>
    </div>
  );
};