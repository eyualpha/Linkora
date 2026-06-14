import type { Post } from "@/types";

export type ShareResult = "shared" | "copied";

export async function sharePost(post: Post): Promise<ShareResult> {
  const author = typeof post.author === "object" ? post.author : null;
  const url = `${window.location.origin}/?post=${post._id}`;
  const caption = post.text?.trim();
  const text = caption
    ? `${author?.username ?? "Someone"} on Linkora: ${caption.slice(0, 160)}`
    : `Check out ${author?.username ?? "this"} post on Linkora`;

  const payload = { title: "Linkora", text, url };

  if (typeof navigator.share === "function") {
    try {
      await navigator.share(payload);
      return "shared";
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        throw err;
      }
    }
  }

  await navigator.clipboard.writeText(`${text}\n${url}`);
  return "copied";
}
