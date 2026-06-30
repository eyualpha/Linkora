import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth-store";
import { notificationsApi } from "@/lib/api";

export const UNREAD_NOTIFICATIONS_QUERY_KEY = ["notifications", "unread-count"] as const;

export function useUnreadNotificationCount() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());

  return useQuery({
    queryKey: UNREAD_NOTIFICATIONS_QUERY_KEY,
    queryFn: async () => (await notificationsApi.unreadCount()).data.unreadCount,
    enabled: isAuthenticated,
    refetchInterval: 20_000,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
    staleTime: 0,
  });
}
