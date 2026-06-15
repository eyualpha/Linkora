import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, MessageCircle, RefreshCw } from "lucide-react";
import { ConversationList } from "@/features/messages/conversation-list";
import { ChatThread } from "@/features/messages/chat-thread";
import { MessageComposer } from "@/features/messages/message-composer";
import { ChatEmptyState } from "@/features/messages/chat-empty-state";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { chatApi, getErrorMessage } from "@/lib/api";
import {
  CONVERSATIONS_QUERY_KEY,
  UNREAD_MESSAGES_QUERY_KEY,
  conversationMessagesKey,
  useUnreadMessageCount,
} from "@/hooks/use-unread-messages";
import { useAuthStore } from "@/stores/auth-store";
import type { ConversationPreview } from "@/types";
import { cn } from "@/lib/utils";

export function MessagesPage() {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((s) => s.user);
  const { refetch: refetchUnread } = useUnreadMessageCount();

  const {
    data: conversations,
    isLoading: conversationsLoading,
    isError: conversationsError,
    error: conversationsQueryError,
    refetch: refetchConversations,
  } = useQuery({
    queryKey: CONVERSATIONS_QUERY_KEY,
    queryFn: async () => (await chatApi.getConversations()).data.conversations,
    refetchInterval: 15_000,
    retry: false,
  });

  const {
    data: messagesData,
    isLoading: messagesLoading,
    isError: messagesError,
    error: messagesQueryError,
    refetch: refetchMessages,
  } = useQuery({
    queryKey: conversationMessagesKey(conversationId ?? ""),
    queryFn: async () => (await chatApi.getMessages(conversationId!)).data,
    enabled: Boolean(conversationId),
    refetchInterval: conversationId ? 5_000 : false,
    retry: false,
  });

  const markReadMutation = useMutation({
    mutationFn: () => chatApi.markRead(conversationId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_MESSAGES_QUERY_KEY });
    },
  });

  const sendMutation = useMutation({
    mutationFn: (content: string) => chatApi.sendMessage(conversationId!, content),
    onSuccess: (response) => {
      queryClient.setQueryData(conversationMessagesKey(conversationId!), (old: typeof messagesData) => {
        if (!old) return old;
        return {
          ...old,
          messages: [...old.messages, response.data.message],
        };
      });
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_MESSAGES_QUERY_KEY });
    },
  });

  useEffect(() => {
    refetchUnread();
  }, [refetchUnread]);

  useEffect(() => {
    if (!conversationId || messagesLoading || messagesError) return;
    const unread = messagesData?.conversation?.unreadCount ?? 0;
    if (unread > 0 && !markReadMutation.isPending) {
      markReadMutation.mutate();
    }
  }, [conversationId, messagesData?.conversation?.unreadCount, messagesLoading, messagesError]);

  const handleSelectConversation = (conversation: ConversationPreview) => {
    navigate(`/messages/${conversation._id}`);
  };

  const otherUser =
    messagesData?.conversation?.otherUser ??
    conversations?.find((c) => c._id === conversationId)?.otherUser;

  const showThread = Boolean(conversationId);
  const chatApiError = conversationsError
    ? getErrorMessage(conversationsQueryError, "Could not load conversations.")
    : messagesError
      ? getErrorMessage(messagesQueryError, "Could not load messages.")
      : null;

  return (
    <section className="flex min-h-[calc(100dvh-11rem)] flex-col lg:min-h-[calc(100dvh-9rem)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {showThread && (
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 lg:hidden"
              onClick={() => navigate("/messages")}
              aria-label="Back to inbox"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <MessageCircle className="h-5 w-5" />
            Messages
          </h2>
        </div>
        {(conversationsError || messagesError) && (
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => {
              void refetchConversations();
              if (conversationId) void refetchMessages();
            }}
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        )}
      </div>

      {chatApiError && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {chatApiError}
          {chatApiError.toLowerCase().includes("not found") && (
            <p className="mt-1 text-xs opacity-90">
              If you are on production, redeploy the backend with the latest chat API changes.
            </p>
          )}
        </div>
      )}

      <div className="glass-card flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl lg:flex-row">
        <aside
          className={cn(
            "flex min-h-[420px] flex-col border-border lg:min-h-0 lg:w-[320px] lg:shrink-0 lg:border-r xl:w-[360px]",
            showThread ? "hidden lg:flex" : "flex flex-1 lg:flex-none"
          )}
        >
          <div className="border-b border-border px-4 py-3">
            <p className="text-sm font-semibold">Inbox</p>
            <p className="text-xs text-muted">Tap a profile&apos;s Message button to start chatting</p>
          </div>
          <div className="min-h-0 flex-1 overflow-hidden">
            <ConversationList
              conversations={conversations}
              isLoading={conversationsLoading}
              activeId={conversationId}
              onSelect={handleSelectConversation}
              hasError={conversationsError}
            />
          </div>
        </aside>

        <main
          className={cn(
            "flex min-h-[420px] min-w-0 flex-1 flex-col lg:min-h-0",
            !showThread && "hidden lg:flex"
          )}
        >
          {conversationId ? (
            messagesError ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
                <p className="text-sm text-muted">This conversation could not be loaded.</p>
                <Button variant="outline" onClick={() => void refetchMessages()}>
                  Try again
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                  <UserAvatar user={otherUser} className="h-10 w-10" linkToProfile={false} />
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{otherUser?.fullname ?? "Conversation"}</p>
                    <p className="truncate text-xs text-muted">@{otherUser?.username ?? "user"}</p>
                  </div>
                </div>

                <ChatThread
                  messages={messagesData?.messages}
                  isLoading={messagesLoading}
                  currentUser={currentUser}
                  otherUser={otherUser}
                />

                <MessageComposer
                  onSend={async (content) => {
                    await sendMutation.mutateAsync(content);
                  }}
                  disabled={sendMutation.isPending || messagesLoading}
                />
              </>
            )
          ) : (
            <ChatEmptyState variant="welcome" className="flex-1" />
          )}
        </main>
      </div>
    </section>
  );
}
