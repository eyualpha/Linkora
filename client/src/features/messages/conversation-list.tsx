import { formatDistanceToNow } from "date-fns";
import { UserAvatar } from "@/components/shared/user-avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { ChatEmptyState } from "@/features/messages/chat-empty-state";
import { cn } from "@/lib/utils";
import type { ConversationPreview } from "@/types";

interface ConversationListProps {
  conversations: ConversationPreview[] | undefined;
  isLoading: boolean;
  activeId?: string;
  onSelect: (conversation: ConversationPreview) => void;
  hasError?: boolean;
}

export function ConversationList({
  conversations,
  isLoading,
  activeId,
  onSelect,
  hasError,
}: ConversationListProps) {
  if (isLoading) {
    return (
      <div className="space-y-2 p-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <p className="text-sm text-muted">Could not load your inbox.</p>
      </div>
    );
  }

  if (!conversations?.length) {
    return <ChatEmptyState variant="inbox" className="h-full" />;
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-1 p-2">
        {conversations.map((conversation) => {
          const isActive = conversation._id === activeId;
          const hasUnread = conversation.unreadCount > 0;
          const preview = conversation.lastMessage?.content ?? "Start a conversation";
          const time = conversation.lastMessage?.createdAt ?? conversation.updatedAt;

          return (
            <button
              key={conversation._id}
              type="button"
              onClick={() => onSelect(conversation)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors",
                isActive ? "bg-accent" : "hover:bg-accent/60",
                hasUnread && !isActive && "bg-primary/5"
              )}
            >
              <UserAvatar user={conversation.otherUser} className="h-12 w-12 shrink-0" linkToProfile={false} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className={cn("truncate text-sm", hasUnread && "font-semibold")}>
                    {conversation.otherUser?.fullname ?? "Unknown user"}
                  </p>
                  <span className="shrink-0 text-[11px] text-muted">
                    {formatDistanceToNow(new Date(time), { addSuffix: false })}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className={cn("truncate text-xs text-muted", hasUnread && "font-medium text-foreground")}>
                    {preview}
                  </p>
                  {hasUnread && (
                    <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-white">
                      {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
}
