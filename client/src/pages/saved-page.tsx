import { useInfiniteQuery } from "@tanstack/react-query";
import { PostCard } from "@/features/posts/post-card";
import { Skeleton } from "@/components/ui/skeleton";
import { savesApi } from "@/lib/api";

export function SavedPage() {
  const { data, isLoading } = useInfiniteQuery({
    queryKey: ["saves"],
    queryFn: async ({ pageParam = 1 }) => (await savesApi.getAll(pageParam)).data,
    getNextPageParam: (last) =>
      last.pagination.page < last.pagination.totalPages ? last.pagination.page + 1 : undefined,
    initialPageParam: 1,
  });

  const posts = data?.pages.flatMap((p) => p.posts) ?? [];

  return (
    <section>
      <h2 className="mb-4 text-xl font-bold">Saved posts</h2>
      {isLoading ? (
        <div className="grid items-start gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-96 rounded-3xl" />
          ))}
        </div>
      ) : posts.length ? (
        <div className="grid items-start gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      ) : (
        <p className="text-muted">No saved posts yet.</p>
      )}
    </section>
  );
}
