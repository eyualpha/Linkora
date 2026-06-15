import axios, { type AxiosError } from "axios";
import { useAuthStore } from "@/stores/auth-store";

function normalizeApiBaseUrl(value: string) {
  const trimmed = value.replace(/\/$/, "");
  if (trimmed === "/api" || trimmed.endsWith("/api")) return trimmed;
  return `${trimmed}/api`;
}

function resolveApiBaseUrl() {
  // Production: always same-origin /api → Vercel middleware proxies to backend (no CORS).
  if (import.meta.env.PROD) return "/api";

  const env = import.meta.env.VITE_API_URL?.trim();
  if (!env) return "/api";
  return normalizeApiBaseUrl(env);
}

const API_URL = resolveApiBaseUrl();

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export function getErrorMessage(error: unknown, fallback = "Something went wrong") {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string" && message.trim()) return message;
    return fallback;
  }
  if (error instanceof Error && !import.meta.env.PROD) {
    return error.message;
  }
  return fallback;
}
