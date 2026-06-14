import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Bookmark,
  Compass,
  Home,
  LogOut,
  Settings,
} from "lucide-react";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/stores/auth-store";
import { cn, formatCount } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Feed", icon: Home },
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "/saved", label: "Saved", icon: Bookmark },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  return (
    <aside className="sticky top-6 flex h-[calc(100vh-3rem)] w-[280px] shrink-0 flex-col rounded-[2rem] glass-card p-6">
      <Link to="/" className="mb-8 font-brand text-3xl text-primary">
        Linkora
      </Link>

      <Link to={user ? `/profile/${user._id}` : "/"} className="mb-6 flex flex-col items-center text-center">
        <UserAvatar user={user} className="h-24 w-24 border-4 border-white shadow-md" />
        <h2 className="mt-4 text-lg font-bold">{user?.fullname}</h2>
        <p className="text-sm text-muted">@{user?.username}</p>

        <div className="mt-4 grid w-full grid-cols-2 gap-2 text-center">
          {[
            { label: "Followers", value: user?.followers?.length ?? 0 },
            { label: "Following", value: user?.following?.length ?? 0 },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-base font-bold">{formatCount(stat.value)}</p>
              <p className="text-xs text-muted">{stat.label}</p>
            </div>
          ))}
        </div>

        {user?.bio && (
          <p className="mt-4 line-clamp-3 text-sm text-gray-600">{user.bio}</p>
        )}
      </Link>

      <Separator className="mb-4" />

      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors",
                active ? "bg-accent text-foreground" : "text-muted hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </nav>

      <Button
        variant="ghost"
        className="mt-auto justify-start gap-3 rounded-2xl px-4 text-muted hover:text-red-500"
        onClick={() => {
          logout();
          navigate("/login");
        }}
      >
        <LogOut className="h-5 w-5" />
        Logout
      </Button>
    </aside>
  );
}

export function MobileNav() {
  const location = useLocation();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-border bg-card/95 px-4 py-3 backdrop-blur lg:hidden">
      {navItems.map(({ to, label, icon: Icon }) => {
        const active = location.pathname === to;
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
