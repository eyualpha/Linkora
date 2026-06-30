import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, LogIn, MessageCircle, Plus, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usersApi } from "@/lib/api";
import { UserAvatar } from "@/components/shared/user-avatar";
import { NotificationDot } from "@/components/shared/notification-dot";
import { CreatePostDialog } from "@/features/posts/create-post-dialog";
import { ThemeToggle } from "@/components/theme-toggle";
import { useUnreadNotificationCount } from "@/hooks/use-unread-notifications";
import { useUnreadMessageCount } from "@/hooks/use-unread-messages";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useAuthStore } from "@/stores/auth-store";
import { getLoginPath } from "@/lib/auth-redirect";
import type { User } from "@/types";

export function TopBar() {
  const navigate = useNavigate();
  const { isAuthenticated, requireAuth } = useRequireAuth();
  const currentUser = useAuthStore((s) => s.user);
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const { data: unreadCount = 0 } = useUnreadNotificationCount();
  const { data: unreadMessages = 0 } = useUnreadMessageCount();

  const { data: searchResults } = useQuery({
    queryKey: ["users", "search", query],
    queryFn: async () => (await usersApi.search(query)).data.users,
    enabled: query.trim().length >= 2,
  });

  return (
    <>
      <header className="mb-6 flex items-center gap-3 sm:gap-4">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            placeholder="Search users..."
            className="pl-11"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            onBlur={() => setTimeout(() => setShowResults(false), 200)}
          />
          {showResults && query.length >= 2 && (
            <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-xl border bg-card shadow-xl">
              {searchResults?.length ? (
                searchResults.map((user: User) => (
                  <button
                    key={user._id}
                    type="button"
                    className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-accent"
                    onMouseDown={() => navigate(`/profile/${user._id}`)}
                  >
                    <UserAvatar user={user} className="h-10 w-10" linkToProfile={false} />
                    <div>
                      <p className="text-sm font-semibold">{user.fullname}</p>
                      <p className="text-xs text-muted">@{user.username}</p>
                    </div>
                  </button>
                ))
              ) : (
                <p className="px-4 py-3 text-sm text-muted">No users found</p>
              )}
            </div>
          )}
        </div>

        <ThemeToggle />

        {isAuthenticated && currentUser && (
          <UserAvatar user={currentUser} className="hidden h-9 w-9 sm:block" />
        )}

        {isAuthenticated ? (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="relative shrink-0 rounded-full"
              onClick={() => navigate("/notifications")}
              aria-label={
                unreadCount > 0
                  ? `Notifications, ${unreadCount} unread`
                  : "Notifications"
              }
            >
              <Bell className="h-5 w-5" />
              <NotificationDot count={unreadCount} />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="relative shrink-0 rounded-full"
              onClick={() => navigate("/messages")}
              aria-label={
                unreadMessages > 0
                  ? `Messages, ${unreadMessages} unread`
                  : "Messages"
              }
            >
              <MessageCircle className="h-5 w-5" />
              <NotificationDot count={unreadMessages} />
            </Button>

            <Button
              className="hidden shrink-0 gap-2 sm:flex"
              onClick={() => {
                if (requireAuth()) setCreateOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Create a post
            </Button>
            <Button
              size="icon"
              className="shrink-0 sm:hidden"
              onClick={() => {
                if (requireAuth()) setCreateOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <Button asChild variant="outline" className="shrink-0 gap-2">
            <Link to={getLoginPath()}>
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">Sign in</span>
            </Link>
          </Button>
        )}
      </header>

      {isAuthenticated && (
        <CreatePostDialog open={createOpen} onOpenChange={setCreateOpen} />
      )}
    </>
  );
}
