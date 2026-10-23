import type { Metadata } from "next";
import type { AnnouncementCategory } from "@nb-church/db";
import { prisma } from "@nb-church/db";
import { pageMetadata } from "@/lib/metadata";
import { getServiceTimes } from "@/lib/settings";
import {
  getWeekWindow,
  buildThisWeekAgenda,
  getNextOccurrence,
} from "@/lib/announcements";
import { SectionBand } from "@/components/ui/section-band";
import { PageHero } from "@/components/ui/page-hero";
import { Eyebrow } from "@/components/ui/eyebrow";
import { StaggeredHeading } from "@/components/ui/staggered-heading";
import { WeekAgenda } from "@/components/announcements/week-agenda";
import { CategoryFilter } from "@/components/announcements/category-filter";
import { AnnouncementCard } from "@/components/announcements/announcement-card";

const UPCOMING_CANDIDATE_LIMIT = 50;
const UPCOMING_PAGE_SIZE = 9;

export function generateMetadata(): Metadata {
  return pageMetadata({
    title: "Weekly Announcements",
    description:
      "What's happening this week at The New Breed Church, plus upcoming services, outreach, and special events.",
    path: "/announcements",
  });
}

export default async function AnnouncementsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const window = getWeekWindow();
  const now = new Date();

  const [serviceTimes, thisWeekAnnouncements, upcomingCandidates] = await Promise.all([
    getServiceTimes(),
    prisma.announcement.findMany({
      where: { status: "PUBLISHED" },
      // Bounded: recurring announcements are few in practice and this only
      // needs to cover the current week's occurrences, not the whole table.
      take: UPCOMING_CANDIDATE_LIMIT,
    }),
    prisma.announcement.findMany({
      where: {
        status: "PUBLISHED",
        ...(category ? { category: category as AnnouncementCategory } : {}),
      },
      orderBy: { startDateTime: "asc" },
      take: UPCOMING_CANDIDATE_LIMIT,
      include: { _count: { select: { registrations: true } } },
    }),
  ]);

  const agenda = buildThisWeekAgenda(serviceTimes, thisWeekAnnouncements, window);

  // Recurring announcements don't have a SQL-sortable "next occurrence"
  // column, so this ranks the bounded candidate set (not the whole table)
  // by next occurrence in memory, then takes just the page size to display —
  // still a bounded read overall, per the project's no-unbounded-list
  // standard, just with the final sort/limit done after the DB round trip.
  //
  // Cutoff is `now`, not `window.end` — an announcement dated anywhere in
  // the current week is always < window.end (start of next week), so using
  // window.end as the cutoff silently dropped every current-week
  // announcement from this grid even though it's still upcoming (it would
  // only ever show as a link in the "This Week" agenda above). `now` is a
  // plain absolute-instant comparison against startDateTime (a UTC
  // timestamp), so no Africa/Lagos conversion is needed here — only
  // calendar-day/week boundary math (getWeekWindow) needs that.
  const upcoming = upcomingCandidates
    .map((a) => ({ announcement: a, occurrence: getNextOccurrence(a, now) }))
    .filter((x): x is { announcement: typeof x.announcement; occurrence: Date } =>
      Boolean(x.occurrence)
    )
    .sort((a, b) => a.occurrence.getTime() - b.occurrence.getTime())
    .slice(0, UPCOMING_PAGE_SIZE);

  return (
    <>
      <PageHero
        eyebrow="Announcements"
        lines={["What's", "happening"]}
        image="/images/announcements/announcements-cultural-event.jpg"
        imagePosition="50% 30%"
        description="Stay up to date on what's happening in church this week, and what's coming up next."
      />

      <SectionBand tone="white">
        {/* Not wrapped in RevealSection: this whole page re-renders on every
            category-filter click (a real searchParams navigation), which would
            remount a reveal-on-scroll wrapper and flicker. */}
        <Eyebrow className="text-brand-700 dark:text-brand-300">This week</Eyebrow>
        <div className="mt-6">
          {agenda.length > 0 ? (
            <WeekAgenda items={agenda} />
          ) : (
            <p className="text-current/70">Nothing scheduled this week yet.</p>
          )}
        </div>
      </SectionBand>

      <SectionBand tone="night">
        <Eyebrow>Upcoming</Eyebrow>
        <StaggeredHeading className="mt-6" size="sm" lines={["Upcoming", "announcements"]} haloLine={1} />
        <div className="mt-8">
          <CategoryFilter active={category} />
        </div>

        {upcoming.length === 0 ? (
          <p className="t-body mt-10 text-white/70">
            No upcoming announcements in this category right now — check back soon.
          </p>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map(({ announcement, occurrence }) => (
              <AnnouncementCard key={announcement.id} announcement={announcement} occurrence={occurrence} />
            ))}
          </div>
        )}
      </SectionBand>
    </>
  );
}
