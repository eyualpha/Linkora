import { useInfiniteQuery } from "@tanstack/react-query";
import { StoryBar } from "@/features/stories/story-bar";
import { PostMasonryGrid, PostMasonrySkeleton } from "@/components/shared/post-masonry-grid";
import { Button } from "@/components/ui/button";
import { postsApi } from "@/lib/api";

export function FeedPage() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ["posts", "feed"],
    queryFn: async ({ pageParam = 1 }) => (await postsApi.getFeed(pageParam)).data,
    getNextPageParam: (last) =>
      last.pagination.page < last.pagination.totalPages ? last.pagination.page + 1 : undefined,
    initialPageParam: 1,
  });

  const posts = data?.pages.flatMap((p) => p.posts) ?? [];

  return (
    <div>
      <StoryBar />

      <section>
        <h2 className="mb-4 text-xl font-bold">Feed</h2>
        {isLoading ? (
          <PostMasonrySkeleton />
        ) : (
          <>
            <PostMasonryGrid posts={posts} />
            {hasNextPage && (
              <div className="mt-2 flex justify-center">
                <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                  {isFetchingNextPage ? "Loading..." : "Load more"}
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
