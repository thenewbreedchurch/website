import type { Metadata } from "next";
import Image from "next/image";
import type { AnnouncementCategory } from "@nb-church/db";
import { prisma } from "@nb-church/db";
import { pageMetadata } from "@/lib/metadata";
import { getServiceTimes } from "@/lib/settings";
import {
  getWeekWindow,
  buildThisWeekAgenda,
  getNextOccurrence,
} from "@/lib/announcements";
import { Container } from "@/components/ui/container";
import { WeekAgenda } from "@/components/announcements/week-agenda";
import { CategoryFilter } from "@/components/announcements/category-filter";
import { AnnouncementCard } from "@/components/announcements/announcement-card";
import { RevealSection } from "@/components/journey/reveal-section";

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
  const upcoming = upcomingCandidates
    .map((a) => ({ announcement: a, occurrence: getNextOccurrence(a, window.end) }))
    .filter((x): x is { announcement: typeof x.announcement; occurrence: Date } =>
      Boolean(x.occurrence)
    )
    .sort((a, b) => a.occurrence.getTime() - b.occurrence.getTime())
    .slice(0, UPCOMING_PAGE_SIZE);

  return (
    <>
      <section className="relative flex min-h-[55vh] items-center overflow-hidden">
        <Image
          src="/images/announcements/announcements-cultural-gathering.jpg"
          alt="Members of The New Breed Church at a church gathering"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        <Container className="relative py-16 text-white">
          <h1 className="font-display text-4xl font-bold sm:text-5xl">
            Weekly Announcements
          </h1>
          <p className="mt-3 max-w-xl text-lg text-white/85">
            What&apos;s happening this week, and what&apos;s coming up — no hardcoded
            events, always current.
          </p>
        </Container>
      </section>

      <section className="py-14">
        <Container>
          <RevealSection>
            <h2 className="font-display text-2xl font-bold sm:text-3xl">This Week</h2>
            <div className="mt-6">
              {agenda.length > 0 ? (
                <WeekAgenda items={agenda} />
              ) : (
                <p className="text-current/70">Nothing scheduled this week yet.</p>
              )}
            </div>
          </RevealSection>
        </Container>
      </section>

      <section className="bg-surface-muted py-14">
        <Container>
          <RevealSection>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="font-display text-2xl font-bold sm:text-3xl">
                Upcoming Announcements
              </h2>
            </div>
            <div className="mt-5">
              <CategoryFilter active={category} />
            </div>
          </RevealSection>

          {upcoming.length === 0 ? (
            <p className="mt-10 text-current/70">
              No upcoming announcements in this category right now — check back soon.
            </p>
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {upcoming.map(({ announcement, occurrence }, i) => (
                <AnnouncementCard
                  key={announcement.id}
                  announcement={announcement}
                  occurrence={occurrence}
                  index={i}
                />
              ))}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
