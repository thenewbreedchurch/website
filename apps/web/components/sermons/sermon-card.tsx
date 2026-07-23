import Image from "next/image";
import Link from "next/link";
import { PlayCircle } from "lucide-react";
import type { Sermon } from "@nb-church/db";
import { youtubeThumbnailUrl } from "@/lib/youtube";

const FALLBACK_THUMBS = [
  "/images/sermons/sermons-preaching-1.jpg",
  "/images/sermons/sermons-preaching-2.jpg",
  "/images/sermons/sermons-preaching-3.jpg",
];

export function SermonCard({ sermon, index = 0 }: { sermon: Sermon; index?: number }) {
  const thumbnail =
    sermon.thumbnailUrl ??
    youtubeThumbnailUrl(sermon.videoUrl) ??
    FALLBACK_THUMBS[index % FALLBACK_THUMBS.length];

  return (
    <Link
      href={`/sermons/${sermon.slug}`}
      className="group block overflow-hidden rounded-2xl border border-border bg-surface transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-video overflow-hidden bg-brand-900">
        <Image
          src={thumbnail!}
          alt=""
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 transition-opacity group-hover:opacity-100">
          <PlayCircle size={40} className="text-white" />
        </div>
      </div>
      <div className="p-5">
        {sermon.series && (
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
            {sermon.series}
          </p>
        )}
        <h3 className="mt-1 font-display text-lg font-bold leading-snug">{sermon.title}</h3>
        <p className="mt-1 text-sm text-current/70">{sermon.speaker}</p>
        <div className="mt-3 flex items-center justify-between text-xs text-current/50">
          <span>
            {sermon.publishedAt.toLocaleDateString("en-NG", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
          {sermon.scripture && <span className="truncate pl-2">{sermon.scripture}</span>}
        </div>
      </div>
    </Link>
  );
}
