import { useQuery } from "@tanstack/react-query";
import { chatApi } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

export const UNREAD_MESSAGES_QUERY_KEY = ["conversations", "unread-count"] as const;

export function useUnreadMessageCount() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());

  return useQuery({
    queryKey: UNREAD_MESSAGES_QUERY_KEY,
    queryFn: async () => (await chatApi.unreadCount()).data.unreadCount,
    enabled: isAuthenticated,
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
    staleTime: 0,
    retry: false,
    placeholderData: 0,
  });
}

export const CONVERSATIONS_QUERY_KEY = ["conversations"] as const;

export function conversationMessagesKey(conversationId: string) {
  return ["conversations", conversationId, "messages"] as const;
}
