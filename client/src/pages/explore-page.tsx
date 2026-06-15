import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserPlus } from "lucide-react";
import { PostCard } from "@/features/posts/post-card";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { followsApi, postsApi } from "@/lib/api";

export function ExplorePage() {
  const queryClient = useQueryClient();

  const trending = useInfiniteQuery({
    queryKey: ["posts", "trending"],
    queryFn: async ({ pageParam = 1 }) => (await postsApi.getTrending(pageParam)).data,
    getNextPageParam: (last) =>
      last.pagination.page < last.pagination.totalPages ? last.pagination.page + 1 : undefined,
    initialPageParam: 1,
  });

  const suggestions = useInfiniteQuery({
    queryKey: ["follows", "suggestions"],
    queryFn: async ({ pageParam = 1 }) => (await followsApi.suggestions(pageParam)).data,
    getNextPageParam: (last) =>
      last.pagination.page < last.pagination.totalPages ? last.pagination.page + 1 : undefined,
    initialPageParam: 1,
  });

  const followMutation = useMutation({
    mutationFn: (userId: string) => followsApi.follow(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["follows"] });
    },
  });

  const posts = trending.data?.pages.flatMap((p) => p.posts) ?? [];
  const users = suggestions.data?.pages.flatMap((p) => p.users) ?? [];

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-4 text-xl font-bold">Suggested for you</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {suggestions.isLoading
            ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-3xl" />)
            : users.map((user) => (
                <Card key={user._id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <UserAvatar user={user} className="h-12 w-12" />
                    <div>
                      <p className="font-semibold">{user.fullname}</p>
                      <p className="text-sm text-muted">@{user.username}</p>
                    </div>
                  </div>
                  <Button size="sm" onClick={() => followMutation.mutate(user._id)}>
                    <UserPlus className="mr-1 h-4 w-4" />
                    Follow
                  </Button>
                </Card>
              ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold">Trending</h2>
        {trending.isLoading ? (
          <div className="grid items-start gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-96 rounded-3xl" />
            ))}
          </div>
        ) : (
          <div className="grid items-start gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
