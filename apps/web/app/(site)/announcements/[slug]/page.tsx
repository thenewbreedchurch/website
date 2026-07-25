import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Image from "next/image";
import { CalendarDays, MapPin, Video, Users } from "lucide-react";
import { prisma } from "@nb-church/db";
import { pageMetadata, eventJsonLd, safeJsonLdString } from "@/lib/metadata";
import { getNextOccurrence, CHURCH_TZ } from "@/lib/announcements";
import { Container } from "@/components/ui/container";
import { RegistrationForm } from "@/components/announcements/registration-form";

const dateFormatter = new Intl.DateTimeFormat("en-NG", {
  timeZone: CHURCH_TZ,
  dateStyle: "full",
  timeStyle: "short",
});

async function getAnnouncement(slug: string) {
  const announcement = await prisma.announcement.findUnique({
    where: { slug },
    include: { _count: { select: { registrations: true } } },
  });
  if (!announcement || announcement.status !== "PUBLISHED") return null;
  return announcement;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const announcement = await getAnnouncement(slug);
  if (!announcement) {
    return pageMetadata({ title: "Announcement not found", description: "", path: "/announcements" });
  }
  return pageMetadata({
    title: announcement.title,
    description: announcement.description,
    path: `/announcements/${announcement.slug}`,
    ogImage: announcement.heroImageUrl ?? undefined,
  });
}

export default async function AnnouncementDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const announcement = await getAnnouncement(slug);
  if (!announcement) notFound();

  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const occurrence = getNextOccurrence(announcement, new Date()) ?? announcement.startDateTime;
  const capacityReached =
    announcement.capacity != null && announcement._count.registrations >= announcement.capacity;
  const deadlinePassed =
    announcement.registrationDeadline != null && announcement.registrationDeadline < new Date();

  const jsonLd = eventJsonLd({
    name: announcement.title,
    description: announcement.description,
    startDateTime: occurrence,
    endDateTime: announcement.endDateTime,
    location: announcement.location,
    isOnline: announcement.isOnline,
    onlineUrl: announcement.onlineUrl,
    imageUrl: announcement.heroImageUrl,
    path: `/announcements/${announcement.slug}`,
  });

  return (
    <article className="py-16">
      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{ __html: safeJsonLdString(jsonLd) }}
      />
      <Container className="max-w-3xl">
        {announcement.heroImageUrl && (
          <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-2xl">
            <Image
              src={announcement.heroImageUrl}
              alt=""
              fill
              sizes="(min-width: 1024px) 768px, 100vw"
              className="object-cover"
            />
          </div>
        )}

        <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800 dark:bg-white/10 dark:text-brand-200">
          {announcement.category}
        </span>
        <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
          {announcement.title}
        </h1>

        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-current/70">
          <span className="flex items-center gap-1.5">
            <CalendarDays size={15} /> {dateFormatter.format(occurrence)}
          </span>
          {announcement.isOnline ? (
            <span className="flex items-center gap-1.5">
              <Video size={15} /> Online
              {announcement.onlineUrl && (
                <a
                  href={announcement.onlineUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-brand-700 hover:underline dark:text-brand-300"
                >
                  Join link
                </a>
              )}
            </span>
          ) : (
            announcement.location && (
              <span className="flex items-center gap-1.5">
                <MapPin size={15} /> {announcement.location}
              </span>
            )
          )}
          {announcement.capacity != null && (
            <span className="flex items-center gap-1.5">
              <Users size={15} /> {announcement._count.registrations}/{announcement.capacity}{" "}
              registered
            </span>
          )}
        </div>

        <p className="mt-6 whitespace-pre-line leading-relaxed text-current/85">
          {announcement.description}
        </p>

        {announcement.registrationRequired && (
          <div className="mt-10 rounded-2xl border border-border bg-surface-muted p-6">
            <h2 className="font-display text-xl font-bold">Register</h2>
            {capacityReached ? (
              <p className="mt-2 text-sm text-current/70">
                This event has reached capacity. Contact us if a spot opens up.
              </p>
            ) : deadlinePassed ? (
              <p className="mt-2 text-sm text-current/70">
                The registration deadline for this event has passed.
              </p>
            ) : (
              <div className="mt-4">
                <RegistrationForm announcementId={announcement.id} />
              </div>
            )}
          </div>
        )}
      </Container>
    </article>
  );
}
