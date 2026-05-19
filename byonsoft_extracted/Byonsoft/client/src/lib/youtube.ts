/**
 * Converts any supported YouTube URL format to a privacy-enhanced embed URL.
 * Uses youtube-nocookie.com to avoid "sign in to confirm" bot detection errors.
 * Handles watch, short, mobile, shorts, and existing embed URLs.
 * Returns non-YouTube URLs unchanged.
 */
export function toEmbedUrl(url: string): string {
  if (!url) return url;

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^(www\.|m\.)/, "");

    // Already a nocookie embed — return as-is
    if (host === "youtube-nocookie.com" && parsed.pathname.startsWith("/embed/")) {
      return url;
    }

    // Existing youtube.com embed — upgrade to nocookie domain
    if (host === "youtube.com" && parsed.pathname.startsWith("/embed/")) {
      return `https://www.youtube-nocookie.com${parsed.pathname}`;
    }

    let videoId: string | null = null;

    // youtu.be/VIDEO_ID
    if (host === "youtu.be") {
      videoId = parsed.pathname.slice(1).split("/")[0];
    }

    // youtube.com/watch?v=VIDEO_ID
    if (host === "youtube.com" && parsed.pathname === "/watch") {
      videoId = parsed.searchParams.get("v");
    }

    // youtube.com/shorts/VIDEO_ID
    if (host === "youtube.com" && parsed.pathname.startsWith("/shorts/")) {
      videoId = parsed.pathname.split("/")[2];
    }

    if (videoId) {
      return `https://www.youtube-nocookie.com/embed/${videoId}`;
    }
  } catch {
    // Not a valid URL — return as-is
  }

  return url;
}
