import { apiClient } from "./client";
import type { AuthResponse, User } from "@/types";

export const authApi = {
  register: (data: {
    fullname: string;
    username: string;
    email: string;
    password: string;
    gender: "male" | "female";
  }) =>
    apiClient.post<{ message: string; userId: string }>("/auth/register", data),

  verifyOtp: (data: { userId: string; otp: string }) =>
    apiClient.post<{ message: string }>("/auth/verify-otp", data),

  resendOtp: (data: { userId: string }) =>
    apiClient.post<{ message: string }>("/auth/resend-otp", data),

  login: (data: { email: string; password: string }) =>
    apiClient.post<AuthResponse>("/auth/login", data),

  forgotPassword: (data: { email: string }) =>
    apiClient.post<{ message: string }>("/auth/forgot-password", data),

  verifyResetOtp: (data: { email: string; otp: string }) =>
    apiClient.post<{ message: string }>("/auth/verify-reset-otp", data),

  resetPassword: (data: { email: string; otp: string; newPassword: string }) =>
    apiClient.post<{ message: string }>("/auth/reset-password", data),
};

export const usersApi = {
  getById: (userId: string) => apiClient.get<{ user: User }>(`/users/${userId}`),

  search: (q: string, page = 1) =>
    apiClient.get<{ users: User[]; pagination: { total: number; page: number; limit: number; totalPages: number } }>(
      `/users/search?q=${encodeURIComponent(q)}&page=${page}`
    ),

  updateProfile: (formData: FormData) =>
    apiClient.put<{ message: string; user: User }>("/users/update-profile", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};
