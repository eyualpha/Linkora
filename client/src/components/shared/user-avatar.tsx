import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User } from "@/types";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  user?: Pick<User, "fullname" | "username" | "profilePicture"> | null;
  className?: string;
  fallbackClassName?: string;
}

export function UserAvatar({ user, className, fallbackClassName }: UserAvatarProps) {
  const initials = user?.fullname
    ? user.fullname.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : user?.username?.slice(0, 2).toUpperCase() || "?";

  return (
    <Avatar className={className}>
      <AvatarImage src={user?.profilePicture} alt={user?.username} />
      <AvatarFallback className={fallbackClassName}>{initials}</AvatarFallback>
    </Avatar>
  );
}

interface StoryAvatarProps {
  user?: Pick<User, "fullname" | "username" | "profilePicture"> | null;
  hasUnviewed?: boolean;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
}

const sizes = { sm: "h-14 w-14", md: "h-16 w-16", lg: "h-20 w-20" };

export function StoryAvatar({ user, hasUnviewed = true, size = "md", onClick }: StoryAvatarProps) {
  return (
    <button type="button" onClick={onClick} className="flex flex-col items-center gap-2 text-center">
      <div className={cn("rounded-full", hasUnviewed ? "story-ring" : "story-ring-viewed")}>
        <UserAvatar user={user} className={cn(sizes[size], "border-2 border-white bg-white")} />
      </div>
      <span className="max-w-[72px] truncate text-xs text-gray-600">
        {user?.username || "user"}
      </span>
    </button>
  );
}
