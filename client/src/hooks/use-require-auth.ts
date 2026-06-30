import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth-store";
import { getLoginPath } from "@/lib/auth-redirect";

export function useRequireAuth() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());

  const requireAuth = useCallback(
    (redirectTo?: string) => {
      if (isAuthenticated) return true;
      navigate(getLoginPath(redirectTo));
      return false;
    },
    [isAuthenticated, navigate]
  );

  return { isAuthenticated, requireAuth };
}
