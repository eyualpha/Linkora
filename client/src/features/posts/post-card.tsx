import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, MessageCircle, MoreHorizontal, Share2, Bookmark, Check } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/shared/user-avatar";
import { PostMediaGallery } from "@/components/shared/post-media-gallery";
import { PostDetailDialog } from "./post-detail-dialog";
import { postsApi, savesApi } from "@/lib/api";
import { sharePost } from "@/lib/share";
import { cn, formatCount } from "@/lib/utils";
import type { Post, User } from "@/types";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const queryClient = useQueryClient();
  const [detailOpen, setDetailOpen] = useState(false);
  const [shareStatus, setShareStatus] = useState<"idle" | "shared" | "copied">("idle");
  const author = typeof post.author === "object" ? post.author : null;
  const likesCount = post.likesCount ?? post.likes?.length ?? 0;
  const isLiked = false;

  const likeMutation = useMutation({
    mutationFn: () => postsApi.toggleLike(post._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const saveMutation = useMutation({
    mutationFn: () => savesApi.save(post._id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["saves"] }),
  });

  const handleShare = async () => {
    try {
      const result = await sharePost(post);
      setShareStatus(result);
      setTimeout(() => setShareStatus("idle"), 2000);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      console.error("Share failed:", err);
    }
  };

  return (
    <>
      <Card className="overflow-hidden transition-transform hover:-translate-y-0.5">
        <div className="flex items-center justify-between p-4">
          <Link to={author ? `/profile/${author._id}` : "#"} className="flex items-center gap-3">
            <UserAvatar user={author as User} className="h-10 w-10" />
            <div>
              <p className="text-sm font-semibold">{author?.username}</p>
              <p className="text-xs text-muted">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </p>
            </div>
          </Link>
          <Button variant="ghost" size="icon" className="rounded-full">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>

        <PostMediaGallery
          files={post.files}
          variant="card"
          onImageClick={() => setDetailOpen(true)}
        />

        <div className="space-y-3 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={() => likeMutation.mutate()}
              >
                <Heart className={cn("h-5 w-5", isLiked && "fill-primary text-primary")} />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setDetailOpen(true)}>
                <MessageCircle className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={handleShare}
                title={shareStatus === "copied" ? "Link copied!" : "Share post"}
              >
                {shareStatus !== "idle" ? (
                  <Check className="h-5 w-5 text-primary" />
                ) : (
                  <Share2 className="h-5 w-5" />
                )}
              </Button>
            </div>
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => saveMutation.mutate()}>
              <Bookmark className="h-5 w-5" />
            </Button>
          </div>

          {shareStatus === "copied" && (
            <p className="text-xs text-primary">Link copied to clipboard</p>
          )}
          {shareStatus === "shared" && (
            <p className="text-xs text-primary">Post shared</p>
          )}

          {likesCount > 0 && (
            <p className="text-sm font-semibold">{formatCount(likesCount)} likes</p>
          )}

          {post.text && (
            <p className="text-sm leading-relaxed">
              <span className="mr-2 font-semibold">{author?.username}</span>
              {post.text}
            </p>
          )}
        </div>
      </Card>

      <PostDetailDialog postId={post._id} open={detailOpen} onOpenChange={setDetailOpen} />
    </>
  );
}
