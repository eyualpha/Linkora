import { Link, useLocation, useNavigate } from "react-router-dom";
import { Bookmark, Compass, Home, LogIn, LogOut, MessageCircle, User } from "lucide-react";
import { UserAvatar } from "@/components/shared/user-avatar";
import { NotificationDot } from "@/components/shared/notification-dot";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/stores/auth-store";
import { useUnreadMessageCount } from "@/hooks/use-unread-messages";
import { getLoginPath } from "@/lib/auth-redirect";
import { cn, formatCount } from "@/lib/utils";

const publicNavItems = [
  { to: "/", label: "Feed", icon: Home, showUnread: false as const },
  { to: "/explore", label: "Explore", icon: Compass, showUnread: false as const },
];

const authNavItems = [
  { to: "/messages", label: "Messages", icon: MessageCircle, showUnread: true as const },
  { to: "/saved", label: "Saved", icon: Bookmark, showUnread: false as const },
];

function isNavActive(pathname: string, to: string, profilePath?: string) {
  if (to === "/messages") {
    return pathname === to || pathname.startsWith("/messages/");
  }
  if (profilePath && to === profilePath) {
    return pathname === profilePath;
  }
  return pathname === to;
}

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuthStore();
  const authenticated = isAuthenticated();
  const { data: unreadMessages = 0 } = useUnreadMessageCount();
  const profilePath = user?._id ? `/profile/${user._id}` : "/";

  const sidebarItems = authenticated
    ? [
        ...publicNavItems,
        ...authNavItems,
        { to: profilePath, label: "Profile", icon: User, showUnread: false as const },
      ]
    : publicNavItems;

  return (
    <aside className="sticky top-6 flex h-[calc(100vh-3rem)] w-[280px] shrink-0 flex-col rounded-xl glass-card p-6">
      <Link to="/" className="mb-8 font-brand text-3xl text-primary">
        Linkora
      </Link>

      {authenticated && user ? (
        <div className="mb-6 flex flex-col items-center text-center">
          <UserAvatar user={user} className="h-24 w-24 border-4 border-card shadow-md" />
          <Link to={profilePath} className="mt-4 hover:opacity-80">
            <h2 className="text-lg font-bold">{user.fullname}</h2>
            <p className="text-sm text-muted">@{user.username}</p>
          </Link>

          <div className="mt-4 grid w-full grid-cols-2 gap-2 text-center">
            {[
              { label: "Followers", value: user.followers?.length ?? 0 },
              { label: "Following", value: user.following?.length ?? 0 },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-base font-bold">{formatCount(stat.value)}</p>
                <p className="text-xs text-muted">{stat.label}</p>
              </div>
            ))}
          </div>

          {user.bio && (
            <p className="mt-4 line-clamp-3 text-sm text-muted">{user.bio}</p>
          )}
        </div>
      ) : (
        <div className="mb-6 rounded-2xl border border-border bg-accent/40 p-5 text-center">
          <p className="text-sm font-semibold">Welcome to Linkora</p>
          <p className="mt-1 text-xs text-muted">Browse the feed for free. Sign in to post, like, and chat.</p>
          <Button asChild className="mt-4 w-full">
            <Link to={getLoginPath()}>Sign in</Link>
          </Button>
          <p className="mt-3 text-xs text-muted">
            New here?{" "}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              Create account
            </Link>
          </p>
        </div>
      )}

      <Separator className="mb-4" />

      <nav className="flex flex-1 flex-col gap-1">
        {sidebarItems.map(({ to, label, icon: Icon, showUnread }) => {
          const active = isNavActive(location.pathname, to, profilePath);
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "relative flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                active ? "bg-accent text-foreground" : "text-muted hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
              {showUnread && unreadMessages > 0 && (
                <NotificationDot count={unreadMessages} />
              )}
            </Link>
          );
        })}
      </nav>

      {authenticated ? (
        <Button
          variant="ghost"
          className="mt-auto justify-start gap-3 rounded-lg px-4 text-muted hover:text-red-500"
          onClick={() => {
            logout();
            navigate("/");
          }}
        >
          <LogOut className="h-5 w-5" />
          Logout
        </Button>
      ) : (
        <Button
          variant="outline"
          className="mt-auto justify-start gap-3 rounded-lg px-4"
          onClick={() => navigate(getLoginPath())}
        >
          <LogIn className="h-5 w-5" />
          Sign in
        </Button>
      )}
    </aside>
  );
}

export function MobileNav() {
  const location = useLocation();
  const { user, isAuthenticated } = useAuthStore();
  const authenticated = isAuthenticated();
  const profilePath = user?._id ? `/profile/${user._id}` : "/";

  const mobileItems = authenticated
    ? [...publicNavItems, ...authNavItems, { to: profilePath, label: "Profile", icon: User }]
    : [...publicNavItems, { to: getLoginPath(), label: "Sign in", icon: LogIn }];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-border bg-card/95 px-4 py-3 backdrop-blur lg:hidden">
      {mobileItems.map(({ to, label, icon: Icon }) => {
        const active = isNavActive(location.pathname, to, profilePath);
        return (
          <Link
            key={to}
            to={to}
            className={cn("flex flex-col items-center gap-1 text-xs", active ? "text-primary" : "text-muted")}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
