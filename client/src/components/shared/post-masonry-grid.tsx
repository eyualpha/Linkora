import { PostCard } from "@/features/posts/post-card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Post } from "@/types";

const masonryClassName = "columns-1 gap-6 sm:columns-2 xl:columns-3";

interface PostMasonryGridProps {
  posts: Post[];
  className?: string;
}

export function PostMasonryGrid({ posts, className }: PostMasonryGridProps) {
  return (
    <div className={cn(masonryClassName, className)}>
      {posts.map((post) => (
        <div key={post._id} className="mb-6 break-inside-avoid">
          <PostCard post={post} />
        </div>
      ))}
    </div>
  );
}

interface PostMasonrySkeletonProps {
  count?: number;
  className?: string;
}

const skeletonHeights = ["h-52", "h-80", "h-96", "h-64", "h-72", "h-56"];

export function PostMasonrySkeleton({ count = 6, className }: PostMasonrySkeletonProps) {
  return (
    <div className={cn(masonryClassName, className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="mb-6 break-inside-avoid">
          <Skeleton className={cn("rounded-xl", skeletonHeights[index % skeletonHeights.length])} />
        </div>
      ))}
    </div>
  );
}
