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

  const content =
    images.length === 1 ? (
      <img
        src={images[0].url}
        alt=""
        className={cn(
          "w-full object-cover",
          variant === "card" ? "aspect-square" : "max-h-80 rounded-2xl"
        )}
      />
    ) : (
      <div
        className={cn(
          "grid grid-cols-2 gap-0.5 bg-border",
          variant === "card" ? "aspect-square overflow-hidden" : "gap-2"
        )}
      >
        {images.slice(0, 2).map((file, index) => (
          <img
            key={file.public_id || file.url || index}
            src={file.url}
            alt=""
            className={cn(
              "h-full w-full object-cover",
              variant === "card" ? "min-h-0" : "max-h-64 rounded-xl"
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
        {content}
      </button>
    );
  }

  return <div className={cn("w-full", className)}>{content}</div>;
}
