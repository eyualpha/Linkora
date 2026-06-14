import { apiClient } from "./client";
import type { PaginatedPosts, Post } from "@/types";

export { apiClient, getErrorMessage } from "./client";
export { authApi, usersApi } from "./auth.api";

export const postsApi = {
  getFeed: (page = 1, limit = 12) =>
    apiClient.get<PaginatedPosts>(`/posts?page=${page}&limit=${limit}`),

  getTrending: (page = 1, limit = 12) =>
    apiClient.get<PaginatedPosts>(`/posts/explore/trending?page=${page}&limit=${limit}`),

  getByUser: (userId: string, page = 1) =>
    apiClient.get<PaginatedPosts>(`/posts/user/${userId}?page=${page}`),

  getById: (id: string) => apiClient.get<{ post: Post }>(`/posts/${id}`),

  create: (formData: FormData) =>
    apiClient.post<{ message: string; post: Post }>("/posts", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  toggleLike: (id: string) =>
    apiClient.put<{ message: string; likesCount: number }>(`/posts/like/${id}`),

  delete: (id: string) => apiClient.delete<{ message: string }>(`/posts/${id}`),
};

export const commentsApi = {
  getByPost: (postId: string, page = 1) =>
    apiClient.get<{
      success: boolean;
      data: import("@/types").Comment[];
      count: number;
      pagination: PaginatedPosts["pagination"];
    }>(`/comments/${postId}?page=${page}`),

  add: (postId: string, content: string) =>
    apiClient.post<{ message: string; comment: import("@/types").Comment }>(
      `/comments/${postId}`,
      { content }
    ),

  delete: (id: string) => apiClient.delete<{ message: string }>(`/comments/${id}`),
};

export const followsApi = {
  follow: (userId: string) => apiClient.post<{ message: string }>(`/follows/follow/${userId}`),
  unfollow: (userId: string) => apiClient.post<{ message: string }>(`/follows/unfollow/${userId}`),
  status: (userId: string) => apiClient.get<{ isFollowing: boolean }>(`/follows/status/${userId}`),
  followers: (userId: string, page = 1) =>
    apiClient.get<{
      followers: import("@/types").FollowEntry[];
      pagination: PaginatedPosts["pagination"];
    }>(`/follows/${userId}/followers?page=${page}`),
  followings: (userId: string, page = 1) =>
    apiClient.get<{
      followings: import("@/types").FollowEntry[];
      pagination: PaginatedPosts["pagination"];
    }>(`/follows/${userId}/followings?page=${page}`),
  suggestions: (page = 1) =>
    apiClient.get<{
      users: import("@/types").User[];
      pagination: PaginatedPosts["pagination"];
    }>(`/follows/suggestions?page=${page}`),
};

export const storiesApi = {
  getFeed: () => apiClient.get<{ feed: import("@/types").StoryGroup[] }>("/stories/feed"),
  getByUser: (userId: string) =>
    apiClient.get<{
      user: import("@/types").User;
      stories: import("@/types").StoryItem[];
    }>(`/stories/user/${userId}`),
  create: (formData: FormData) =>
    apiClient.post<{ message: string; story: unknown }>("/stories", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  view: (id: string) => apiClient.post<{ message: string; viewCount: number }>(`/stories/${id}/view`),
  toggleLike: (id: string) =>
    apiClient.put<{ message: string; isLiked: boolean; likesCount: number }>(
      `/stories/like/${id}`
    ),
  delete: (id: string) => apiClient.delete<{ message: string }>(`/stories/${id}`),
};

export const savesApi = {
  getAll: (page = 1) => apiClient.get<PaginatedPosts>(`/saves?page=${page}`),
  save: (postId: string) => apiClient.post<{ message: string }>(`/saves/posts/${postId}`),
  unsave: (postId: string) => apiClient.delete<{ message: string }>(`/saves/posts/${postId}`),
  status: (postId: string) => apiClient.get<{ isSaved: boolean }>(`/saves/posts/${postId}/status`),
};

export const notificationsApi = {
  getAll: (page = 1) =>
    apiClient.get<{
      notifications: import("@/types").Notification[];
      pagination: PaginatedPosts["pagination"];
    }>(`/notifications?page=${page}`),
  unreadCount: () => apiClient.get<{ unreadCount: number }>("/notifications/unread-count"),
  markRead: (id: string) => apiClient.put<{ message: string }>(`/notifications/${id}/read`),
  markAllRead: () => apiClient.put<{ message: string }>("/notifications/read-all"),
  delete: (id: string) => apiClient.delete<{ message: string }>(`/notifications/${id}`),
};
