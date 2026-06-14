import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User } from "@/types";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  user?: Pick<User, "_id" | "fullname" | "username" | "profilePicture"> | null;
  className?: string;
  fallbackClassName?: string;
  /** When true and user has _id, avatar links to their profile. Default: true */
  linkToProfile?: boolean;
}

export function UserAvatar({
  user,
  className,
  fallbackClassName,
  linkToProfile = true,
}: UserAvatarProps) {
  const initials = user?.fullname
    ? user.fullname
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : user?.username?.slice(0, 2).toUpperCase() || "?";

  const avatar = (
    <Avatar
      className={cn(
        linkToProfile && user?._id && "cursor-pointer transition-opacity hover:opacity-90",
        className
      )}
    >
      <AvatarImage src={user?.profilePicture} alt={user?.username} />
      <AvatarFallback className={fallbackClassName}>{initials}</AvatarFallback>
    </Avatar>
  );

  if (linkToProfile && user?._id) {
    return (
      <Link
        to={`/profile/${user._id}`}
        onClick={(e) => e.stopPropagation()}
        aria-label={`View ${user.username}'s profile`}
      >
        {avatar}
      </Link>
    );
  }

  return avatar;
}

interface StoryAvatarProps {
  user?: Pick<User, "_id" | "fullname" | "username" | "profilePicture"> | null;
  hasUnviewed?: boolean;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
}

const sizes = { sm: "h-14 w-14", md: "h-16 w-16", lg: "h-20 w-20" };

export function StoryAvatar({ user, hasUnviewed = true, size = "md", onClick }: StoryAvatarProps) {
  return (
    <button type="button" onClick={onClick} className="flex flex-col items-center gap-2 text-center">
      <div className={cn("rounded-full", hasUnviewed ? "story-ring" : "story-ring-viewed")}>
        <UserAvatar
          user={user}
          linkToProfile={false}
          className={cn(sizes[size], "border-2 border-card bg-card")}
        />
      </div>
      <span className="max-w-[72px] truncate text-xs text-muted">{user?.username || "user"}</span>
    </button>
  );
}
