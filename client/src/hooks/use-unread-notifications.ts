import { useQuery } from "@tanstack/react-query";
import { notificationsApi } from "@/lib/api";

export const UNREAD_NOTIFICATIONS_QUERY_KEY = ["notifications", "unread-count"] as const;

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: UNREAD_NOTIFICATIONS_QUERY_KEY,
    queryFn: async () => (await notificationsApi.unreadCount()).data.unreadCount,
    refetchInterval: 20_000,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
    staleTime: 0,
  });
}
