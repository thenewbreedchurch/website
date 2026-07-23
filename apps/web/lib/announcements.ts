import { RRule } from "rrule";
import { toZonedTime, fromZonedTime } from "date-fns-tz";
import { addDays, startOfDay } from "date-fns";
import type { Announcement, ServiceTime, DayOfWeek } from "@nb-church/db";

// The church is in Lagos, Nigeria (UTC+1, no DST) — all "this week"/"today"
// window math must anchor to this timezone, not server-local time (which on
// Vercel is UTC) or it'll roll over at the wrong hour for Lagos users.
export const CHURCH_TZ = "Africa/Lagos";

const DAY_INDEX: Record<DayOfWeek, number> = {
  MON: 0,
  TUE: 1,
  WED: 2,
  THU: 3,
  FRI: 4,
  SAT: 5,
  SUN: 6,
};

export interface WeekWindow {
  /** Monday 00:00:00 Africa/Lagos, expressed as a UTC instant. */
  start: Date;
  /** Following Monday 00:00:00 Africa/Lagos (exclusive end), as a UTC instant. */
  end: Date;
}

/** The Mon-Sun window (Africa/Lagos local days) containing `reference`. */
export function getWeekWindow(reference: Date = new Date()): WeekWindow {
  const zoned = toZonedTime(reference, CHURCH_TZ);
  const zonedDayIndex = (zoned.getDay() + 6) % 7; // JS getDay(): Sun=0 -> convert to Mon=0
  const zonedMonday = startOfDay(addDays(zoned, -zonedDayIndex));
  const zonedNextMonday = addDays(zonedMonday, 7);

  return {
    start: fromZonedTime(zonedMonday, CHURCH_TZ),
    end: fromZonedTime(zonedNextMonday, CHURCH_TZ),
  };
}

export interface AgendaItem {
  date: Date;
  dayIndex: number; // 0=Mon .. 6=Sun
  label: string;
  time: string;
  isOnline: boolean;
  onlineUrl: string | null;
  location: string | null;
  kind: "service" | "announcement";
  announcementSlug?: string;
}

/** Every ServiceTime occurrence that falls inside the given week window. */
export function expandServiceTimesForWeek(
  serviceTimes: ServiceTime[],
  window: WeekWindow
): AgendaItem[] {
  const items: AgendaItem[] = [];
  const zonedMonday = toZonedTime(window.start, CHURCH_TZ);

  for (const st of serviceTimes) {
    const dayIndex = DAY_INDEX[st.dayOfWeek];
    const zonedDate = addDays(zonedMonday, dayIndex);
    items.push({
      date: fromZonedTime(zonedDate, CHURCH_TZ),
      dayIndex,
      label: st.label,
      time: st.endTime ? `${st.startTime} - ${st.endTime}` : st.startTime,
      isOnline: st.isOnline,
      onlineUrl: st.onlineUrl,
      location: st.location,
      kind: "service",
    });
  }

  return items;
}

/**
 * Every occurrence of a single Announcement that falls inside the given
 * window — either its one explicit startDateTime, or (if recurrenceRule is
 * set) every RRULE occurrence anchored to that startDateTime.
 */
export function expandAnnouncementOccurrencesInWindow(
  announcement: Pick<Announcement, "startDateTime" | "recurrenceRule">,
  window: WeekWindow
): Date[] {
  if (!announcement.recurrenceRule) {
    return announcement.startDateTime >= window.start &&
      announcement.startDateTime < window.end
      ? [announcement.startDateTime]
      : [];
  }

  const rule = RRule.fromString(
    `DTSTART:${toRRuleUTCString(announcement.startDateTime)}\nRRULE:${announcement.recurrenceRule}`
  );
  return rule.between(window.start, window.end, true);
}

/** The next occurrence of an announcement strictly after `after`, or null if it has none. */
export function getNextOccurrence(
  announcement: Pick<Announcement, "startDateTime" | "recurrenceRule">,
  after: Date
): Date | null {
  if (!announcement.recurrenceRule) {
    return announcement.startDateTime > after ? announcement.startDateTime : null;
  }
  const rule = RRule.fromString(
    `DTSTART:${toRRuleUTCString(announcement.startDateTime)}\nRRULE:${announcement.recurrenceRule}`
  );
  return rule.after(after, false);
}

function toRRuleUTCString(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

/**
 * Merges ServiceTime + PUBLISHED Announcement occurrences into a single
 * Mon-Sun agenda, grouped and sorted by day then time. Pure function — takes
 * already-fetched rows, does no DB access, so it's unit-testable in
 * isolation from Prisma (the highest-risk pure-logic piece per the plan).
 */
export function buildThisWeekAgenda(
  serviceTimes: ServiceTime[],
  announcements: Announcement[],
  window: WeekWindow
): AgendaItem[] {
  const items = expandServiceTimesForWeek(serviceTimes, window);

  for (const announcement of announcements) {
    const occurrences = expandAnnouncementOccurrencesInWindow(announcement, window);
    for (const date of occurrences) {
      const zonedMonday = toZonedTime(window.start, CHURCH_TZ);
      const zonedDate = toZonedTime(date, CHURCH_TZ);
      const dayIndex = Math.round(
        (startOfDay(zonedDate).getTime() - startOfDay(zonedMonday).getTime()) /
          (24 * 60 * 60 * 1000)
      );
      items.push({
        date,
        dayIndex,
        label: announcement.title,
        time: toZonedTime(date, CHURCH_TZ).toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isOnline: announcement.isOnline,
        onlineUrl: announcement.onlineUrl,
        location: announcement.location,
        kind: "announcement",
        announcementSlug: announcement.slug,
      });
    }
  }

  return items.sort((a, b) => a.date.getTime() - b.date.getTime());
}
