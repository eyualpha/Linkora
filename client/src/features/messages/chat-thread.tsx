import { useEffect, useRef } from "react";
import { format, isToday, isYesterday } from "date-fns";
import { Sparkles } from "lucide-react";
import { UserAvatar } from "@/components/shared/user-avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { ChatMessage, User } from "@/types";

function formatMessageTime(date: string) {
  const d = new Date(date);
  if (isToday(d)) return format(d, "h:mm a");
  if (isYesterday(d)) return `Yesterday ${format(d, "h:mm a")}`;
  return format(d, "MMM d, h:mm a");
}

function formatDayLabel(date: string) {
  const d = new Date(date);
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "MMMM d, yyyy");
}

interface ChatThreadProps {
  messages: ChatMessage[] | undefined;
  isLoading: boolean;
  currentUser: User | null;
  otherUser: User | undefined;
}

export function ChatThread({ messages, isLoading, currentUser, otherUser }: ChatThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(0);

  useEffect(() => {
    if (!messages?.length) return;
    if (messages.length >= prevCountRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevCountRef.current = messages.length;
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-3 p-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton
            key={i}
            className={cn("h-10 max-w-[60%] rounded-2xl", i % 2 === 0 ? "mr-auto" : "ml-auto")}
          />
        ))}
      </div>
    );
  }

  if (!messages?.length) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
        <div className="relative mb-5">
          <UserAvatar user={otherUser} className="h-20 w-20 border-4 border-card shadow-lg" linkToProfile={false} />
          <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-rose-500 shadow-md">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
        </div>
        <p className="text-lg font-semibold">{otherUser?.fullname ?? "New chat"}</p>
        <p className="mt-1 max-w-xs text-sm text-muted">
          This is the beginning of your conversation with @{otherUser?.username ?? "them"}.
        </p>
        <p className="mt-4 rounded-full bg-accent px-4 py-1.5 text-xs font-medium text-muted">
          Send a message below to say hello
        </p>
      </div>
    );
  }

  let lastDayLabel = "";

  return (
    <ScrollArea className="min-h-0 flex-1">
      <div className="flex flex-col gap-1 px-4 py-4">
        {messages.map((message) => {
          const isOwn = message.sender._id === currentUser?._id;
          const dayLabel = formatDayLabel(message.createdAt);
          const showDay = dayLabel !== lastDayLabel;
          lastDayLabel = dayLabel;

          return (
            <div key={message._id}>
              {showDay && (
                <div className="my-4 flex justify-center">
                  <span className="rounded-full bg-accent px-3 py-1 text-[11px] font-medium text-muted">
                    {dayLabel}
                  </span>
                </div>
              )}
              <div className={cn("mb-2 flex gap-2", isOwn ? "flex-row-reverse" : "flex-row")}>
                {!isOwn && (
                  <UserAvatar user={message.sender} className="mt-1 h-8 w-8 shrink-0" linkToProfile={false} />
                )}
                <div className={cn("flex max-w-[75%] flex-col", isOwn ? "items-end" : "items-start")}>
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm",
                      isOwn
                        ? "rounded-br-md bg-primary text-white"
                        : "rounded-bl-md border border-border bg-card"
                    )}
                  >
                    {message.content}
                  </div>
                  <span className="mt-1 px-1 text-[10px] text-muted">
                    {formatMessageTime(message.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
