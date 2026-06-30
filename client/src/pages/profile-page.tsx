import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useInfiniteQuery } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";
import { UserAvatar } from "@/components/shared/user-avatar";
import { PostGrid } from "@/components/shared/post-grid";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { followsApi, postsApi, usersApi, chatApi, getErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { formatCount } from "@/lib/utils";

export function ProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.user);
  const { isAuthenticated, requireAuth } = useRequireAuth();
  const queryClient = useQueryClient();
  const isOwnProfile = currentUser?._id === userId;

  const { data: profile, isLoading } = useQuery({
    queryKey: ["users", userId],
    queryFn: async () => (await usersApi.getById(userId!)).data.user,
    enabled: Boolean(userId),
  });

  const { data: followStatus } = useQuery({
    queryKey: ["follows", "status", userId],
    queryFn: async () => (await followsApi.status(userId!)).data.isFollowing,
    enabled: Boolean(userId) && !isOwnProfile && isAuthenticated,
  });

  const posts = useInfiniteQuery({
    queryKey: ["posts", "user", userId],
    queryFn: async ({ pageParam = 1 }) => (await postsApi.getByUser(userId!, pageParam)).data,
    getNextPageParam: (last) =>
      last.pagination.page < last.pagination.totalPages ? last.pagination.page + 1 : undefined,
    initialPageParam: 1,
    enabled: Boolean(userId),
  });

  const followMutation = useMutation({
    mutationFn: () =>
      followStatus ? followsApi.unfollow(userId!) : followsApi.follow(userId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["follows", "status", userId] });
      queryClient.invalidateQueries({ queryKey: ["users", userId] });
    },
  });

  const [messageError, setMessageError] = useState("");

  const messageMutation = useMutation({
    mutationFn: () => chatApi.getOrCreate(userId!),
    onMutate: () => setMessageError(""),
    onSuccess: (response) => {
      navigate(`/messages/${response.data.conversation._id}`);
    },
    onError: (error) => {
      setMessageError(getErrorMessage(error, "Could not open chat. Try again."));
    },
  });

  if (isLoading) return <Skeleton className="h-64 w-full rounded-3xl" />;
  if (!profile) return <p>User not found</p>;

  const userPosts = posts.data?.pages.flatMap((p) => p.posts) ?? [];

  return (
    <div className="space-y-8">
      <div className="glass-card rounded-3xl p-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <UserAvatar user={profile} linkToProfile={false} className="h-28 w-28 border-4 border-card shadow-lg" />
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-bold">{profile.fullname}</h1>
            <p className="text-muted">@{profile.username}</p>
            {profile.bio && <p className="mt-3 text-sm text-gray-600">{profile.bio}</p>}

            <div className="mt-4 flex justify-center gap-8 sm:justify-start">
              <div className="text-center">
                <p className="font-bold">{formatCount(userPosts.length)}</p>
                <p className="text-xs text-muted">Posts</p>
              </div>
              <div className="text-center">
                <p className="font-bold">{formatCount(profile.followers?.length ?? 0)}</p>
                <p className="text-xs text-muted">Followers</p>
              </div>
              <div className="text-center">
                <p className="font-bold">{formatCount(profile.following?.length ?? 0)}</p>
                <p className="text-xs text-muted">Following</p>
              </div>
            </div>

            {!isOwnProfile && (
              <div className="mt-6 flex flex-wrap justify-center gap-3 sm:justify-start">
                <Button
                  variant={followStatus ? "outline" : "default"}
                  onClick={() => {
                    if (!requireAuth()) return;
                    followMutation.mutate();
                  }}
                  disabled={followMutation.isPending}
                >
                  {isAuthenticated && followStatus ? "Unfollow" : "Follow"}
                </Button>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => {
                    if (!requireAuth()) return;
                    messageMutation.mutate();
                  }}
                  disabled={messageMutation.isPending}
                >
                  <MessageCircle className="h-4 w-4" />
                  {messageMutation.isPending ? "Opening..." : "Message"}
                </Button>
              </div>
            )}
            {messageError && (
              <p className="mt-3 text-center text-sm text-red-500 sm:text-left">{messageError}</p>
            )}
          </div>
        </div>
      </div>

      <section>
        <h2 className="mb-4 text-xl font-bold">Posts</h2>
        <PostGrid posts={userPosts} />
      </section>
    </div>
  );
}
