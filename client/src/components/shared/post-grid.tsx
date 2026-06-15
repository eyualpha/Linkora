import { PostCard } from "@/features/posts/post-card";
import { cn } from "@/lib/utils";
import type { Post } from "@/types";

interface PostGridProps {
  posts: Post[];
  className?: string;
}

export function PostGrid({ posts, className }: PostGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 items-start gap-6 sm:grid-cols-2 xl:grid-cols-3",
        className
      )}
    >
      {posts.map((post) => (
        <PostCard key={post._id} post={post} />
      ))}
    </div>
  );
}
