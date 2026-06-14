import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { storiesApi } from "@/lib/api";
import { UserAvatar } from "@/components/shared/user-avatar";
import { useAuthStore } from "@/stores/auth-store";
import { cn, formatCount } from "@/lib/utils";
import type { StoryGroup, StoryItem } from "@/types";

interface StoryViewerProps {
  group: StoryGroup;
  onClose: () => void;
}

export function StoryViewer({ group, onClose }: StoryViewerProps) {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((s) => s.user);
  const [index, setIndex] = useState(0);
  const [stories, setStories] = useState<StoryItem[]>(group.stories);
  const story = stories[index];
  const isOwnStory = Boolean(
    currentUser?._id && group.user._id && currentUser._id === group.user._id
  );

  const viewMutation = useMutation({
    mutationFn: (id: string) => storiesApi.view(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["stories"] }),
  });

  const likeMutation = useMutation({
    mutationFn: (id: string) => storiesApi.toggleLike(id),
    onSuccess: (res, storyId) => {
      setStories((prev) =>
        prev.map((item) =>
          item._id === storyId
            ? {
                ...item,
                isLiked: res.data.isLiked,
                likesCount: res.data.likesCount,
              }
            : item
        )
      );
      queryClient.invalidateQueries({ queryKey: ["stories"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const handleNext = () => {
    if (index < stories.length - 1) {
      const next = index + 1;
      setIndex(next);
      viewMutation.mutate(stories[next]._id);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (index > 0) setIndex(index - 1);
  };

  useEffect(() => {
    if (story && !story.viewed) viewMutation.mutate(story._id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story?._id, story?.viewed]);

  if (!story) return null;

  const isVideo = story.media.resource_type === "video";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
      <button
        type="button"
        className="absolute right-4 top-4 z-20 rounded-full p-2 text-white hover:bg-white/10"
        onClick={onClose}
        aria-label="Close story"
      >
        <X className="h-6 w-6" />
      </button>

      <div className="relative h-[min(80dvh,calc((100vw-2rem)*16/9))] w-[min(100%,calc(80dvh*9/16),calc((100vw-2rem)))] max-w-md overflow-hidden rounded-2xl bg-black shadow-2xl">
        {isVideo ? (
          <video
            src={story.media.url}
            className="absolute inset-0 h-full w-full object-contain"
            controls
            autoPlay
          />
        ) : (
          <img
            src={story.media.url}
            alt=""
            className="absolute inset-0 h-full w-full object-contain"
          />
        )}

        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-black/70 via-black/30 to-transparent px-4 pb-10 pt-12">
          <div className="pointer-events-auto flex items-center gap-3">
            <UserAvatar
              user={group.user}
              className="h-10 w-10 shrink-0 border-2 border-white"
            />
            <div className="min-w-0 text-white">
              <p className="truncate text-sm font-semibold">{group.user.username}</p>
              <p className="text-xs opacity-80">
                {index + 1} / {stories.length}
              </p>
            </div>
          </div>
        </div>

        {!isOwnStory && (
          <div className="pointer-events-none absolute bottom-0 right-0 z-10 p-4">
            <button
              type="button"
              className="pointer-events-auto flex flex-col items-center gap-1 text-white"
              onClick={() => likeMutation.mutate(story._id)}
              disabled={likeMutation.isPending}
              aria-label={story.isLiked ? "Unlike story" : "Like story"}
            >
              <span className="rounded-full p-2 transition-colors hover:bg-white/10">
                <Heart
                  className={cn(
                    "h-7 w-7 transition-colors",
                    story.isLiked && "fill-red-500 text-red-500"
                  )}
                />
              </span>
              {story.likesCount > 0 && (
                <span className="text-xs font-semibold">{formatCount(story.likesCount)}</span>
              )}
            </button>
          </div>
        )}

        {story.caption?.trim() && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-4 pb-6 pt-16 pr-16">
            <p className="pointer-events-auto text-sm leading-relaxed text-white">
              {story.caption}
            </p>
          </div>
        )}

        {index > 0 && (
          <button
            type="button"
            className="absolute left-0 top-1/2 z-10 -translate-y-1/2 p-2 text-white hover:bg-white/10"
            onClick={handlePrev}
            aria-label="Previous story"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>
        )}
        <button
          type="button"
          className="absolute right-0 top-1/2 z-10 -translate-y-1/2 p-2 text-white hover:bg-white/10"
          onClick={handleNext}
          aria-label={index < stories.length - 1 ? "Next story" : "Close story"}
        >
          <ChevronRight className="h-8 w-8" />
        </button>
      </div>
    </div>
  );
}
