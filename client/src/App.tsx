import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "@/components/layout/app-layout";
import { GuestRoute, ProtectedRoute } from "@/components/layout/protected-route";
import { LoginPage } from "@/pages/auth/login-page";
import { RegisterPage } from "@/pages/auth/register-page";
import { VerifyOtpPage } from "@/pages/auth/verify-otp-page";
import { ForgotPasswordPage } from "@/pages/auth/forgot-password-page";
import { FeedPage } from "@/pages/feed-page";
import { ExplorePage } from "@/pages/explore-page";
import { ProfilePage } from "@/pages/profile-page";
import { SavedPage } from "@/pages/saved-page";
import { NotificationsPage } from "@/pages/notifications-page";
import { MessagesPage } from "@/pages/messages-page";
import { SettingsPage } from "@/pages/settings-page";
import { PostDeepLinkHandler } from "@/components/shared/post-deep-link";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <PostDeepLinkHandler />
        <Routes>
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-otp" element={<VerifyOtpPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Route>

          <Route element={<AppLayout />}>
            <Route index element={<FeedPage />} />
            <Route path="explore" element={<ExplorePage />} />
            <Route path="profile/:userId" element={<ProfilePage />} />

            <Route element={<ProtectedRoute />}>
              <Route path="saved" element={<SavedPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="messages" element={<MessagesPage />} />
              <Route path="messages/:conversationId" element={<MessagesPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
