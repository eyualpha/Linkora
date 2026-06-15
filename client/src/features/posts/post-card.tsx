import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart, MessageCircle, Share2, Bookmark, Check, UserPlus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/shared/user-avatar";
import { PostMediaGallery } from "@/components/shared/post-media-gallery";
import { PostDetailDialog } from "./post-detail-dialog";
import { followsApi, postsApi, savesApi } from "@/lib/api";
import { sharePost } from "@/lib/share";
import { useAuthStore } from "@/stores/auth-store";
import { cn, formatCount } from "@/lib/utils";
import type { Post, User } from "@/types";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((s) => s.user);
  const [detailOpen, setDetailOpen] = useState(false);
  const [shareStatus, setShareStatus] = useState<"idle" | "shared" | "copied">("idle");
  const author = typeof post.author === "object" ? post.author : null;
  const authorId = author?._id;
  const isOwnPost = Boolean(currentUser?._id && authorId && currentUser._id === authorId);
  const likesCount = post.likesCount ?? post.likes?.length ?? 0;
  const isLiked = false;

  const { data: isFollowing } = useQuery({
    queryKey: ["follows", "status", authorId],
    queryFn: async () => (await followsApi.status(authorId!)).data.isFollowing,
    enabled: Boolean(authorId && !isOwnPost),
  });

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

  const followMutation = useMutation({
    mutationFn: () => followsApi.follow(authorId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["follows", "status", authorId] });
      queryClient.invalidateQueries({ queryKey: ["follows"] });
    },
  });

  const handleShare = async () => {
    try {
      const result = await sharePost(post);
      setShareStatus(result);
      setTimeout(() => setShareStatus("idle"), 2000);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
    }
  };

  const showFollowAction = !isOwnPost && authorId && isFollowing !== undefined;
  const hasMedia = (post.files ?? []).some((file) => file.url);

  return (
    <>
      <Card className="w-full overflow-hidden transition-transform hover:-translate-y-0.5">
        <div className="flex items-center justify-between gap-2 p-4">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <UserAvatar user={author as User} className="h-10 w-10 shrink-0" />
            <Link
              to={authorId ? `/profile/${authorId}` : "#"}
              className="min-w-0 hover:opacity-80"
            >
              <p className="truncate text-sm font-semibold">{author?.username}</p>
              <p className="text-xs text-muted">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </p>
            </Link>
          </div>

          {showFollowAction &&
            (isFollowing ? (
              <Button
                size="sm"
                variant="outline"
                className="shrink-0 border-border bg-transparent px-3 text-muted hover:bg-transparent"
                disabled
              >
                Following
              </Button>
            ) : (
              <Button
                size="sm"
                className="shrink-0 gap-1.5 px-3"
                onClick={() => followMutation.mutate()}
                disabled={followMutation.isPending}
              >
                <UserPlus className="h-4 w-4" />
                Follow
              </Button>
            ))}
        </div>

        {!hasMedia && post.text && (
          <div className="px-4 pb-3">
            <p className="text-sm leading-relaxed">{post.text}</p>
          </div>
        )}

        {hasMedia && (
          <PostMediaGallery
            files={post.files}
            variant="card"
            onImageClick={() => setDetailOpen(true)}
          />
        )}

        <div className={cn("space-y-3 p-4", !hasMedia && "pt-0")}>
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

          {hasMedia && post.text && (
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
