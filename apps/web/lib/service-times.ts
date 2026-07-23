import type { ServiceTime } from "@nb-church/db";

export const DAY_LABELS: Record<string, string> = {
  MON: "Mon",
  TUE: "Tue",
  WED: "Wed",
  THU: "Thu",
  FRI: "Fri",
  SAT: "Sat",
  SUN: "Sun",
};

export interface GroupedServiceTime {
  key: string;
  days: string;
  time: string;
  label: string;
  isOnline: boolean;
  onlineUrl: string | null;
}

/** Collapses e.g. 6 identical Mon-Sat "Morning Prayers" rows into one display entry. */
export function groupConsecutiveServiceTimes(
  serviceTimes: ServiceTime[]
): GroupedServiceTime[] {
  const byKey = new Map<string, ServiceTime[]>();
  const order: string[] = [];

  for (const st of serviceTimes) {
    const key = `${st.label}|${st.startTime}|${st.endTime ?? ""}`;
    if (!byKey.has(key)) {
      byKey.set(key, []);
      order.push(key);
    }
    byKey.get(key)!.push(st);
  }

  return order.map((key) => {
    const [label, start, end] = key.split("|");
    const rows = byKey.get(key)!;
    const days = rows.map((r) => r.dayOfWeek);
    const dayLabel =
      days.length >= 5 && days.includes("MON") && days.includes("SAT")
        ? "Mon-Sat"
        : days.map((d) => DAY_LABELS[d] ?? d).join(", ");
    const time = end ? `${start} - ${end}` : start;
    return {
      key,
      days: dayLabel,
      time,
      label: label!,
      isOnline: rows[0]!.isOnline,
      onlineUrl: rows[0]!.onlineUrl,
    };
  });
}
