import Image from "next/image";
import Link from "next/link";
import { CalendarDays, MapPin, Video } from "lucide-react";
import type { Announcement } from "@nb-church/db";
import { CHURCH_TZ } from "@/lib/announcements";
import { AnnouncementDescription } from "./announcement-description";

const FALLBACK_IMAGES = [
  "/images/announcements/announcements-community-sports-1.jpg",
  "/images/announcements/announcements-cultural-gathering.jpg",
  "/images/announcements/announcements-outdoor-fellowship.jpg",
  "/images/announcements/announcements-community-unity.jpg",
];

const dateFormatter = new Intl.DateTimeFormat("en-NG", {
  timeZone: CHURCH_TZ,
  weekday: "short",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

// Deterministic per-announcement hash, not the list position — the
// Upcoming Announcements grid re-renders with a different, filtered list
// (and thus a different index for the same card) every time the category
// filter changes, which previously made a no-heroImage announcement's
// fallback image change depending on which filter was active.
function fallbackImageFor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  return FALLBACK_IMAGES[Math.abs(hash) % FALLBACK_IMAGES.length]!;
}

export function AnnouncementCard({
  announcement,
  occurrence,
}: {
  announcement: Announcement;
  occurrence: Date;
}) {
  const image = announcement.heroImageUrl ?? fallbackImageFor(announcement.id);

  return (
    <Link
      href={`/announcements/${announcement.slug}`}
      className="group block overflow-hidden rounded-2xl border border-border bg-surface transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-brand-900">
        <Image
          src={image!}
          alt=""
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-brand-800">
          {announcement.category}
        </span>
      </div>
      <div className="p-5">
        <h3 className="font-display text-lg font-bold leading-snug">{announcement.title}</h3>
        <div className="mt-2">
          <AnnouncementDescription description={announcement.description} />
        </div>
        <div className="mt-3 flex flex-col gap-1 text-xs text-current/60">
          <span className="flex items-center gap-1.5">
            <CalendarDays size={13} /> {dateFormatter.format(occurrence)}
          </span>
          {(announcement.isOnline || announcement.location) && (
            <span className="flex items-center gap-1.5">
              {announcement.isOnline ? <Video size={13} /> : <MapPin size={13} />}
              {announcement.isOnline ? "Online" : announcement.location}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
