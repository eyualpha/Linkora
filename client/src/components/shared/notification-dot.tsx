interface NotificationDotProps {
  count: number;
}

export function NotificationDot({ count }: NotificationDotProps) {
  if (count <= 0) return null;

  return (
    <span
      className="absolute right-1 top-1 flex h-2.5 w-2.5"
      aria-label={`${count} unread notification${count === 1 ? "" : "s"}`}
    >
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-60" />
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-card" />
    </span>
  );
}
