import Link from "next/link";
import { Video, MapPin } from "lucide-react";
import type { AgendaItem } from "@/lib/announcements";

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function WeekAgenda({ items }: { items: AgendaItem[] }) {
  const byDay = new Map<number, AgendaItem[]>();
  for (const item of items) {
    if (!byDay.has(item.dayIndex)) byDay.set(item.dayIndex, []);
    byDay.get(item.dayIndex)!.push(item);
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {DAY_NAMES.map((dayName, dayIndex) => {
        const dayItems = byDay.get(dayIndex) ?? [];
        if (dayItems.length === 0) return null;

        return (
          <div key={dayIndex} className="rounded-2xl border border-border bg-surface p-5">
            <h3 className="font-display text-base font-bold">{dayName}</h3>
            <ul className="mt-3 space-y-3">
              {dayItems.map((item, i) => (
                <li key={`${item.kind}-${i}-${item.time}`} className="text-sm">
                  <p className="font-medium text-current/90">{item.time}</p>
                  {item.kind === "announcement" && item.announcementSlug ? (
                    <Link
                      href={`/announcements/${item.announcementSlug}`}
                      className="text-brand-700 hover:underline dark:text-brand-300"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <p className="text-current/70">{item.label}</p>
                  )}
                  {(item.isOnline || item.location) && (
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-current/50">
                      {item.isOnline ? <Video size={12} /> : <MapPin size={12} />}
                      {item.isOnline ? "Online" : item.location}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
