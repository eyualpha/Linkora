import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { StoryAvatar } from "@/components/shared/user-avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { storiesApi } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { StoryViewer } from "./story-viewer";
import { CreateStoryDialog } from "./create-story-dialog";
import type { StoryGroup } from "@/types";

export function StoryBar() {
  const user = useAuthStore((s) => s.user);
  const { isAuthenticated, requireAuth } = useRequireAuth();
  const [viewerGroup, setViewerGroup] = useState<StoryGroup | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const { data: feed, isLoading } = useQuery({
    queryKey: ["stories", "feed"],
    queryFn: async () => (await storiesApi.getFeed()).data.feed,
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-bold">Stories</h2>
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-4 pb-2">
            <button
              type="button"
              className="flex flex-col items-center gap-2"
              onClick={() => {
                if (requireAuth()) setCreateOpen(true);
              }}
            >
              <div className="relative">
                <StoryAvatar user={user} hasUnviewed={false} hideLabel />
                <span className="absolute bottom-6 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white ring-2 ring-white">
                  <Plus className="h-3.5 w-3.5" />
                </span>
              </div>
              <span className="text-xs text-muted">Your story</span>
            </button>

            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-16 rounded-full" />
                ))
              : feed?.map((group) => (
                  <StoryAvatar
                    key={group.user._id}
                    user={group.user}
                    hasUnviewed={group.hasUnviewed}
                    onClick={() => setViewerGroup(group)}
                  />
                ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </section>

      <CreateStoryDialog open={createOpen} onOpenChange={setCreateOpen} />
      {viewerGroup && (
        <StoryViewer group={viewerGroup} onClose={() => setViewerGroup(null)} />
      )}
    </>
  );
}
