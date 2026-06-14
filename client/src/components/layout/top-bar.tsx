import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, MessageCircle, Plus, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { notificationsApi, usersApi } from "@/lib/api";
import { UserAvatar } from "@/components/shared/user-avatar";
import { CreatePostDialog } from "@/features/posts/create-post-dialog";
import { ThemeToggle } from "@/components/theme-toggle";
import type { User } from "@/types";

export function TopBar() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const { data: unread } = useQuery({
    queryKey: ["notifications", "unread"],
    queryFn: async () => (await notificationsApi.unreadCount()).data.unreadCount,
    refetchInterval: 30000,
  });

  const { data: searchResults } = useQuery({
    queryKey: ["users", "search", query],
    queryFn: async () => (await usersApi.search(query)).data.users,
    enabled: query.trim().length >= 2,
  });

  return (
    <>
      <header className="mb-6 flex items-center gap-4">
        <div className="relative flex-1">
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
            <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border bg-card shadow-xl">
              {searchResults?.length ? (
                searchResults.map((user: User) => (
                  <button
                    key={user._id}
                    type="button"
                    className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-accent"
                    onMouseDown={() => navigate(`/profile/${user._id}`)}
                  >
                    <UserAvatar user={user} className="h-10 w-10" />
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

        <Button variant="ghost" size="icon" className="relative rounded-full" onClick={() => navigate("/notifications")}>
          <Bell className="h-5 w-5" />
          {unread ? (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
              {unread > 9 ? "9+" : unread}
            </span>
          ) : null}
        </Button>

        <Button variant="ghost" size="icon" className="rounded-full">
          <MessageCircle className="h-5 w-5" />
        </Button>

        <Button className="hidden gap-2 sm:flex" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Create a post
        </Button>
        <Button size="icon" className="sm:hidden" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
        </Button>
      </header>

      <CreatePostDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
  );
}
