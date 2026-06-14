export interface User {
  _id: string;
  fullname: string;
  username: string;
  email?: string;
  bio?: string;
  gender?: string;
  profilePicture?: string;
  coverPicture?: string;
  followers?: string[];
  following?: string[];
  isVerified?: boolean;
  isAdmin?: boolean;
  createdAt?: string;
}

export interface PostFile {
  url: string;
  public_id?: string;
  resource_type?: string;
}

export interface Post {
  _id: string;
  author: User | string;
  text?: string;
  files?: PostFile[];
  likes?: string[];
  likesCount?: number;
  createdAt: string;
  updatedAt?: string;
  comments?: Comment[];
}

export interface Comment {
  _id: string;
  postId: string;
  author: User;
  content: string;
  createdAt: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedPosts {
  posts: Post[];
  pagination: Pagination;
}

export interface StoryItem {
  _id: string;
  media: PostFile;
  caption?: string;
  expiresAt: string;
  createdAt: string;
  viewed: boolean;
  viewCount: number;
}

export interface StoryGroup {
  user: User;
  stories: StoryItem[];
  hasUnviewed: boolean;
}

export interface Notification {
  _id: string;
  sender: User;
  type: "like" | "comment" | "follow" | "story_view" | "mention";
  message: string;
  post?: Post;
  isRead: boolean;
  createdAt: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface FollowEntry {
  follower?: User;
  following?: User;
  createdAt?: string;
}
