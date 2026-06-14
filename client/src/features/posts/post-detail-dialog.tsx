import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Send, Share2, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserAvatar } from "@/components/shared/user-avatar";
import { PostMediaGallery } from "@/components/shared/post-media-gallery";
import { Skeleton } from "@/components/ui/skeleton";
import { commentsApi, postsApi } from "@/lib/api";
import { getErrorMessage } from "@/lib/api/client";
import { sharePost } from "@/lib/share";
import type { Post, User } from "@/types";

interface PostDetailDialogProps {
  postId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PostDetailDialog({ postId, open, onOpenChange }: PostDetailDialogProps) {
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [shareStatus, setShareStatus] = useState<"idle" | "shared" | "copied">("idle");

  const { data: post, isLoading } = useQuery({
    queryKey: ["posts", postId],
    queryFn: async () => (await postsApi.getById(postId)).data.post,
    enabled: open,
  });

  const { data: comments } = useQuery({
    queryKey: ["comments", postId],
    queryFn: async () => (await commentsApi.getByPost(postId)).data.data,
    enabled: open,
  });

  const commentMutation = useMutation({
    mutationFn: () => commentsApi.add(postId, comment.trim()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      setComment("");
      setError("");
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const handleShare = async () => {
    if (!post) return;
    try {
      const result = await sharePost(post as Post);
      setShareStatus(result);
      setTimeout(() => setShareStatus("idle"), 2000);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      console.error("Share failed:", err);
    }
  };

  const author = post && typeof post.author === "object" ? post.author : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between pr-8">
            <DialogTitle>Post details</DialogTitle>
            <Button variant="outline" size="sm" className="gap-2" onClick={handleShare} disabled={!post}>
              {shareStatus !== "idle" ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
              {shareStatus === "copied" ? "Copied" : shareStatus === "shared" ? "Shared" : "Share"}
            </Button>
          </div>
        </DialogHeader>

        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : post ? (
          <div className="space-y-4">
            <PostMediaGallery files={post.files} variant="detail" />
            {post.text && <p className="text-sm">{post.text}</p>}

            <div className="space-y-3">
              <h4 className="font-semibold">Comments</h4>
              {comments?.map((c) => (
                <div key={c._id} className="flex gap-3">
                  <UserAvatar user={c.author} className="h-8 w-8" />
                  <div>
                    <p className="text-sm">
                      <span className="font-semibold">{c.author.username}</span> {c.content}
                    </p>
                  </div>
                </div>
              ))}
              {!comments?.length && <p className="text-sm text-muted">No comments yet</p>}
            </div>

            <div className="flex gap-2">
              <UserAvatar user={author as User} className="h-8 w-8" />
              <Input
                placeholder="Add a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && comment.trim() && commentMutation.mutate()}
              />
              <Button size="icon" onClick={() => commentMutation.mutate()} disabled={!comment.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
