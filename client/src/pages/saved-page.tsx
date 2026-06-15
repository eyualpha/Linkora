import { useInfiniteQuery } from "@tanstack/react-query";
import { PostMasonryGrid, PostMasonrySkeleton } from "@/components/shared/post-masonry-grid";
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
        <PostMasonrySkeleton count={3} />
      ) : posts.length ? (
        <PostMasonryGrid posts={posts} />
      ) : (
        <p className="text-muted">No saved posts yet.</p>
      )}
    </section>
  );
}
