import { prisma } from "@nb-church/db";
import { CHURCH_TZ, getNextOccurrence } from "@/lib/announcements";
import { SectionBand } from "@/components/ui/section-band";
import { Eyebrow } from "@/components/ui/eyebrow";
import { StaggeredHeading } from "@/components/ui/staggered-heading";
import { RuledRow } from "@/components/ui/ruled-row";
import { TextLink } from "@/components/ui/text-link";

const SHOWN = 5;

const whenFormatter = new Intl.DateTimeFormat("en-NG", {
  timeZone: CHURCH_TZ,
  weekday: "long",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

/**
 * "Upcoming events" band (wearethenew.org's events list): big uppercase name,
 * small when/where, underlined actions. Fed by published announcements, ranked
 * by next occurrence in memory (recurring ones have no sortable SQL column).
 */
export async function UpcomingEvents() {
  const now = new Date();
  const candidates = await prisma.announcement.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { startDateTime: "asc" },
    take: 50,
  });

  const upcoming = candidates
    .map((announcement) => ({ announcement, occurrence: getNextOccurrence(announcement, now) }))
    .filter((x): x is { announcement: (typeof candidates)[number]; occurrence: Date } =>
      Boolean(x.occurrence)
    )
    .sort((a, b) => a.occurrence.getTime() - b.occurrence.getTime())
    .slice(0, SHOWN);

  if (upcoming.length === 0) return null;

  return (
    <SectionBand tone="violet">
      <Eyebrow className="text-center text-white/80 sm:text-left">Events</Eyebrow>
      <div className="mt-6 flex justify-center">
        <StaggeredHeading
          lines={["Upcoming", "events"]}
          haloLine={1}
          haloClassName="text-white"
          align="center"
        />
      </div>

      <div className="mt-14 sm:mt-16">
        {upcoming.map(({ announcement, occurrence }) => (
          <RuledRow
            key={announcement.id}
            className="flex-col items-center gap-y-4 text-center sm:items-start sm:text-left lg:flex-row lg:items-center lg:flex-nowrap"
          >
            <div className="flex flex-col items-center gap-x-5 gap-y-2 sm:items-start lg:flex-row lg:items-baseline">
              <h3 className="text-balance text-[clamp(1.75rem,5.5vw,3.125rem)] font-bold uppercase leading-[1] tracking-tight">
                {announcement.title}
              </h3>
              <p className="t-eyebrow text-white/75">
                {whenFormatter.format(occurrence)}
                {announcement.isOnline ? " · Online" : announcement.location ? ` · ${announcement.location}` : ""}
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 sm:justify-start lg:justify-end [--link-accent:var(--color-white)]">
              {announcement.isOnline && announcement.onlineUrl && (
                <TextLink href={announcement.onlineUrl} external>
                  Join online
                </TextLink>
              )}
              <TextLink href={`/announcements/${announcement.slug}`}>Details</TextLink>
            </div>
          </RuledRow>
        ))}
      </div>

      <div className="mt-12 flex justify-center [--link-accent:var(--color-white)]">
        <TextLink href="/announcements">All announcements</TextLink>
      </div>
    </SectionBand>
  );
}
