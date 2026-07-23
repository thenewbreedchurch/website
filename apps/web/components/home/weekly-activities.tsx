import { Clock, Video } from "lucide-react";
import type { ServiceTime, DayOfWeek } from "@nb-church/db";

const WEEK_ORDER: DayOfWeek[] = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const DAY_LABELS: Record<DayOfWeek, string> = {
  MON: "Monday",
  TUE: "Tuesday",
  WED: "Wednesday",
  THU: "Thursday",
  FRI: "Friday",
  SAT: "Saturday",
  SUN: "Sunday",
};

interface ActivityLine {
  time: string;
  label: string;
  isOnline: boolean;
  onlineUrl: string | null;
}

interface ActivityCard {
  key: string;
  daysLabel: string;
  lines: ActivityLine[];
}

/**
 * Groups live ServiceTime rows into day-based cards the same way the legacy
 * homepage laid them out (Sunday / Wednesday / Monday-Saturday), but derived
 * from real DB data instead of hand-duplicated HTML — this is what fixes the
 * legacy site's 4-6x-duplicated, driftable service-times markup.
 */
function buildActivityCards(serviceTimes: ServiceTime[]): ActivityCard[] {
  const byLineKey = new Map<string, { line: ActivityLine; days: Set<DayOfWeek> }>();

  for (const st of serviceTimes) {
    const time = st.endTime ? `${st.startTime} - ${st.endTime}` : st.startTime;
    const lineKey = `${st.label}|${time}|${st.isOnline}|${st.onlineUrl ?? ""}`;
    if (!byLineKey.has(lineKey)) {
      byLineKey.set(lineKey, {
        line: { time, label: st.label, isOnline: st.isOnline, onlineUrl: st.onlineUrl },
        days: new Set(),
      });
    }
    byLineKey.get(lineKey)!.days.add(st.dayOfWeek);
  }

  function daysLabelFor(days: Set<DayOfWeek>): string {
    const sorted = WEEK_ORDER.filter((d) => days.has(d));
    if (sorted.length >= 5 && days.has("MON") && days.has("SAT") && !days.has("SUN")) {
      return "Monday - Saturday";
    }
    return sorted.map((d) => DAY_LABELS[d]).join(", ");
  }

  const byDaysLabel = new Map<string, ActivityLine[]>();
  const order: string[] = [];
  for (const { line, days } of byLineKey.values()) {
    const daysLabel = daysLabelFor(days);
    if (!byDaysLabel.has(daysLabel)) {
      byDaysLabel.set(daysLabel, []);
      order.push(daysLabel);
    }
    byDaysLabel.get(daysLabel)!.push(line);
  }

  return order.map((daysLabel) => ({
    key: daysLabel,
    daysLabel,
    lines: byDaysLabel.get(daysLabel)!,
  }));
}

export function WeeklyActivities({ serviceTimes }: { serviceTimes: ServiceTime[] }) {
  const cards = buildActivityCards(serviceTimes);

  if (cards.length === 0) {
    return null;
  }

  return (
    <section className="bg-surface-muted py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="font-display text-3xl font-bold sm:text-4xl">Weekly Activities</h2>
        <p className="mt-2 text-current/70">Join us in person or online — every week, real time.</p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <div
              key={card.key}
              className="rounded-2xl border border-border bg-surface p-6 shadow-sm"
            >
              <h3 className="font-display text-xl font-semibold text-brand-700 dark:text-brand-300">
                {card.daysLabel}
              </h3>
              <ul className="mt-4 space-y-3">
                {card.lines.map((line) => (
                  <li key={`${line.label}-${line.time}`} className="flex items-start gap-2 text-sm">
                    <Clock size={16} className="mt-0.5 shrink-0 text-current/50" />
                    <span>
                      <span className="font-medium">{line.time}</span> — {line.label}
                      {line.isOnline && line.onlineUrl && (
                        <a
                          href={line.onlineUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-1.5 inline-flex items-center gap-1 text-brand-700 hover:underline dark:text-brand-300"
                        >
                          <Video size={14} />
                          Join online
                        </a>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
