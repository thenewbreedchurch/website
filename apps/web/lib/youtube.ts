/** Extracts a YouTube video ID from any common URL shape (youtu.be, watch?v=, embed/, shorts/). */
export function extractYoutubeId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "youtu.be") {
      return parsed.pathname.slice(1) || null;
    }
    if (parsed.hostname.includes("youtube.com")) {
      const v = parsed.searchParams.get("v");
      if (v) return v;
      const match = parsed.pathname.match(/\/(embed|shorts)\/([^/?]+)/);
      if (match) return match[2] ?? null;
    }
    return null;
  } catch {
    return null;
  }
}

export function youtubeEmbedUrl(url: string): string | null {
  const id = extractYoutubeId(url);
  return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
}

export function youtubeThumbnailUrl(url: string): string | null {
  const id = extractYoutubeId(url);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
}
