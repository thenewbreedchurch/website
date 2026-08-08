import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import type { Sermon } from "@nb-church/db";
import { youtubeThumbnailUrl, SERMON_FALLBACK_THUMBNAILS } from "@/lib/youtube";

export function SermonCard({ sermon, index = 0 }: { sermon: Sermon; index?: number }) {
  const thumbnail =
    sermon.thumbnailUrl ??
    youtubeThumbnailUrl(sermon.videoUrl) ??
    SERMON_FALLBACK_THUMBNAILS[index % SERMON_FALLBACK_THUMBNAILS.length];

  return (
    <Link
      href={`/sermons/${sermon.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-video overflow-hidden bg-brand-900">
        <Image
          src={thumbnail!}
          alt=""
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black/70 transition-colors group-hover:bg-brand-700">
            <Play size={24} className="translate-x-0.5 fill-white text-white" />
          </div>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        {sermon.series && (
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
            {sermon.series}
          </p>
        )}
        <h3 className="mt-1 font-display text-lg font-bold leading-snug">{sermon.title}</h3>
        <p className="mt-1 text-sm text-current/70">{sermon.speaker}</p>
        <div className="mt-auto flex items-center justify-between pt-3 text-xs text-current/50">
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
