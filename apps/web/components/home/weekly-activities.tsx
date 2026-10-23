import type { ServiceTime, DayOfWeek } from "@nb-church/db";
import { SectionBand } from "@/components/ui/section-band";
import { Eyebrow } from "@/components/ui/eyebrow";
import { StaggeredHeading } from "@/components/ui/staggered-heading";
import { RuledRow } from "@/components/ui/ruled-row";
import { TextLink } from "@/components/ui/text-link";

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

export function WeeklyActivities({
  serviceTimes,
  tone = "violet",
}: {
  serviceTimes: ServiceTime[];
  tone?: "violet" | "night";
}) {
  const cards = buildActivityCards(serviceTimes);

  if (cards.length === 0) {
    return null;
  }

  return (
    <SectionBand tone={tone} id="weekly" className="scroll-mt-20">
      <Eyebrow className={tone === "violet" ? "text-white/80" : undefined}>Weekly</Eyebrow>
      <div className="mt-6 flex justify-center">
        <StaggeredHeading
          lines={["Weekly", "Gatherings"]}
          haloLine={1}
          haloClassName={tone === "violet" ? "text-white" : "text-brand-400"}
          align="center"
        />
      </div>

      <div className="mt-16">
        {cards.flatMap((card) =>
          card.lines.map((line) => (
            <RuledRow key={`${card.key}-${line.label}-${line.time}`}>
              <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
                <h3 className="t-display-sm !font-bold">{line.label}</h3>
                <p className="t-eyebrow text-white/75">
                  {card.daysLabel} · {line.time}
                </p>
              </div>
              {line.isOnline && line.onlineUrl && (
                <TextLink href={line.onlineUrl} external>
                  Join online
                </TextLink>
              )}
            </RuledRow>
          ))
        )}
      </div>
    </SectionBand>
  );
}
