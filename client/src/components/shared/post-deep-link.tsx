import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PostDetailDialog } from "@/features/posts/post-detail-dialog";

export function PostDeepLinkHandler() {
  const [searchParams, setSearchParams] = useSearchParams();
  const postId = searchParams.get("post");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (postId) setOpen(true);
  }, [postId]);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next && postId) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete("post");
      setSearchParams(nextParams, { replace: true });
    }
  };

  if (!postId) return null;

  return <PostDetailDialog postId={postId} open={open} onOpenChange={handleOpenChange} />;
}
