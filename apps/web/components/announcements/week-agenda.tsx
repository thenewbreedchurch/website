import Link from "next/link";
import { Clock, Video, MapPin } from "lucide-react";
import type { AgendaItem } from "@/lib/announcements";
import { TiltCard } from "@/components/journey/tilt-card";

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// Visually matches components/home/weekly-activities.tsx's card language
// (TiltCard, hover lift, Clock-icon lines) — previously this used a plain,
// un-hovered card in a fixed 4-column grid that skipped empty days, which
// left a ragged, uneven layout whenever fewer than 4 days had anything
// scheduled. sm:grid-cols-2 lg:grid-cols-3 wraps naturally instead.
export function WeekAgenda({ items }: { items: AgendaItem[] }) {
  const byDay = new Map<number, AgendaItem[]>();
  for (const item of items) {
    if (!byDay.has(item.dayIndex)) byDay.set(item.dayIndex, []);
    byDay.get(item.dayIndex)!.push(item);
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {DAY_NAMES.map((dayName, dayIndex) => {
        const dayItems = byDay.get(dayIndex) ?? [];
        if (dayItems.length === 0) return null;

        return (
          <TiltCard
            key={dayIndex}
            className="rounded-2xl border border-border bg-surface p-6 shadow-sm transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            <h3 className="font-display text-xl font-semibold text-brand-700 dark:text-brand-300">
              {dayName}
            </h3>
            <ul className="mt-4 space-y-3">
              {dayItems.map((item, i) => (
                <li key={`${item.kind}-${i}-${item.time}`} className="flex items-start gap-2 text-sm">
                  <Clock size={16} className="mt-0.5 shrink-0 text-current/50" />
                  <span>
                    <span className="font-medium">{item.time}</span> —{" "}
                    {item.kind === "announcement" && item.announcementSlug ? (
                      <Link
                        href={`/announcements/${item.announcementSlug}`}
                        className="text-brand-700 hover:underline dark:text-brand-300"
                      >
                        {item.label}
                      </Link>
                    ) : (
                      item.label
                    )}
                    {(item.isOnline || item.location) && (
                      <span className="mt-0.5 flex items-center gap-1 text-xs text-current/50">
                        {item.isOnline ? <Video size={12} /> : <MapPin size={12} />}
                        {item.isOnline ? "Online" : item.location}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </TiltCard>
        );
      })}
    </div>
  );
}
