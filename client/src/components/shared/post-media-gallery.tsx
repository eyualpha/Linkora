import { cn } from "@/lib/utils";
import type { PostFile } from "@/types";

interface PostMediaGalleryProps {
  files?: PostFile[];
  onImageClick?: () => void;
  className?: string;
  variant?: "card" | "detail";
}

export function PostMediaGallery({
  files = [],
  onImageClick,
  className,
  variant = "card",
}: PostMediaGalleryProps) {
  const images = (files ?? []).filter((f) => f.url);
  if (!images.length) return null;

  const isCard = variant === "card";

  const media = (
    <div
      className={cn(
        "overflow-hidden bg-border",
        isCard ? "rounded-lg" : "rounded-xl",
        images.length === 1
          ? isCard
            ? "aspect-square"
            : "w-full"
          : cn(
              "grid grid-cols-2 gap-0.5",
              isCard ? "aspect-square" : "min-h-[220px] max-h-96"
            )
      )}
    >
      {images.slice(0, 2).map((file, index) => (
        <img
          key={file.public_id || file.url || index}
          src={file.url}
          alt=""
          className={cn(
            "h-full w-full object-cover",
            images.length === 1 && !isCard && "max-h-96",
            images.length === 2 && !isCard && "min-h-[220px]"
          )}
        />
      ))}
    </div>
  );

  if (onImageClick) {
    return (
      <button
        type="button"
        onClick={onImageClick}
        className={cn("block w-full text-left", className)}
      >
        {media}
      </button>
    );
  }

  return <div className={cn("w-full", className)}>{media}</div>;
}
