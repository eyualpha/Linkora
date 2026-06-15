import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getErrorMessage } from "@/lib/api";

interface MessageComposerProps {
  onSend: (content: string) => Promise<void>;
  disabled?: boolean;
}

export function MessageComposer({ onSend, disabled }: MessageComposerProps) {
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    const trimmed = content.trim();
    if (!trimmed || sending || disabled) return;

    setSending(true);
    setError("");
    try {
      await onSend(trimmed);
      setContent("");
    } catch (err) {
      setError(getErrorMessage(err, "Failed to send message."));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="border-t border-border bg-card/80 p-4 backdrop-blur">
      <div className="flex items-end gap-2">
        <Textarea
          placeholder="Type a message..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={1}
          className="min-h-[44px] max-h-32 resize-none rounded-2xl"
          disabled={disabled || sending}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void handleSend();
            }
          }}
        />
        <Button
          size="icon"
          className="h-11 w-11 shrink-0 rounded-full"
          onClick={() => void handleSend()}
          disabled={!content.trim() || disabled || sending}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}
