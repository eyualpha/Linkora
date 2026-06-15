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
  hideLabel?: boolean;
  label?: string;
}

const sizes = { sm: "h-14 w-14", md: "h-16 w-16", lg: "h-20 w-20" };

interface StoryProfileRingProps {
  hasUnviewed?: boolean;
  variant?: "feed" | "viewer";
  className?: string;
  children: React.ReactNode;
}

export function StoryProfileRing({
  hasUnviewed = true,
  variant = "feed",
  className,
  children,
}: StoryProfileRingProps) {
  return (
    <div
      className={cn(hasUnviewed ? "story-ring" : "story-ring-viewed", className)}
    >
      <div className={variant === "viewer" ? "story-ring-inner-dark" : "story-ring-inner"}>
        {children}
      </div>
    </div>
  );
}

export function StoryAvatar({
  user,
  hasUnviewed = true,
  size = "md",
  onClick,
  hideLabel = false,
  label,
}: StoryAvatarProps) {
  const displayLabel = label ?? user?.username ?? "user";
  const className = "flex flex-col items-center gap-2 text-center";

  const content = (
    <>
      <StoryProfileRing hasUnviewed={hasUnviewed}>
        <UserAvatar
          user={user}
          linkToProfile={false}
          className={cn(sizes[size], "bg-card")}
        />
      </StoryProfileRing>
      {!hideLabel && (
        <span className="max-w-[72px] truncate text-xs text-muted">{displayLabel}</span>
      )}
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {content}
      </button>
    );
  }

  return <div className={className}>{content}</div>;
}
