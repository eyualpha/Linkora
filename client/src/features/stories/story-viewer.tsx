import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { storiesApi } from "@/lib/api";
import { UserAvatar } from "@/components/shared/user-avatar";
import type { StoryGroup } from "@/types";

interface StoryViewerProps {
  group: StoryGroup;
  onClose: () => void;
}

export function StoryViewer({ group, onClose }: StoryViewerProps) {
  const queryClient = useQueryClient();
  const [index, setIndex] = useState(0);
  const story = group.stories[index];

  const viewMutation = useMutation({
    mutationFn: (id: string) => storiesApi.view(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["stories"] }),
  });

  const handleNext = () => {
    if (index < group.stories.length - 1) {
      const next = index + 1;
      setIndex(next);
      viewMutation.mutate(group.stories[next]._id);
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
      <button type="button" className="absolute right-6 top-6 text-white" onClick={onClose}>
        <X className="h-6 w-6" />
      </button>

      <div className="relative w-full max-w-md">
        <div className="mb-4 flex items-center gap-3 px-2">
          <UserAvatar user={group.user} className="h-10 w-10 border-2 border-white" />
          <div className="text-white">
            <p className="text-sm font-semibold">{group.user.username}</p>
            <p className="text-xs opacity-70">
              {index + 1} / {group.stories.length}
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-black">
          {isVideo ? (
            <video src={story.media.url} className="aspect-[9/16] w-full object-contain" controls autoPlay />
          ) : (
            <img src={story.media.url} alt="" className="aspect-[9/16] w-full object-contain" />
          )}
          {story.caption && (
            <p className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-sm text-white">
              {story.caption}
            </p>
          )}
        </div>

        <button type="button" className="absolute left-0 top-1/2 -translate-y-1/2 p-2 text-white" onClick={handlePrev}>
          <ChevronLeft className="h-8 w-8" />
        </button>
        <button type="button" className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-white" onClick={handleNext}>
          <ChevronRight className="h-8 w-8" />
        </button>
      </div>
    </div>
  );
}
