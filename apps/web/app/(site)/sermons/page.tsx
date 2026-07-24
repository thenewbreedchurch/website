import type { Metadata } from "next";
import { prisma } from "@nb-church/db";
import { getChurchSettings } from "@/lib/settings";
import { pageMetadata } from "@/lib/metadata";
import { Container } from "@/components/ui/container";
import { LinkButton } from "@/components/ui/link-button";
import { SermonCard } from "@/components/sermons/sermon-card";
import { RevealSection } from "@/components/journey/reveal-section";
import { TiltCard } from "@/components/journey/tilt-card";

const PAGE_SIZE = 12;

export function generateMetadata(): Metadata {
  return pageMetadata({
    title: "Sermons",
    description:
      "Watch and revisit messages from The New Breed Church — real teaching from real services, not a highlight reel.",
    path: "/sermons",
  });
}

export default async function SermonsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const pageNum = Math.max(1, Number(page) || 1);

  const [sermons, total, settings] = await Promise.all([
    prisma.sermon.findMany({
      orderBy: { publishedAt: "desc" },
      take: PAGE_SIZE,
      skip: (pageNum - 1) * PAGE_SIZE,
    }),
    prisma.sermon.count(),
    getChurchSettings(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <section className="py-16">
      <Container>
        <RevealSection className="max-w-2xl">
          <h1 className="font-display text-4xl font-bold sm:text-5xl">Sermons</h1>
          <p className="mt-3 text-lg text-current/70">
            Messages from our services — teaching to help you grow, wherever you are in
            your walk.
          </p>
        </RevealSection>

        {sermons.length === 0 ? (
          <p className="mt-10 text-current/70">
            Sermons are being added — check back soon, or watch live on our{" "}
            {settings.youtubeUrl ? (
              <a
                href={settings.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-brand-700 hover:underline dark:text-brand-300"
              >
                YouTube channel
              </a>
            ) : (
              "YouTube channel"
            )}
            .
          </p>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sermons.map((sermon, i) => (
              <TiltCard key={sermon.id}>
                <SermonCard sermon={sermon} index={i} />
              </TiltCard>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-3">
            {pageNum > 1 && (
              <LinkButton
                href={`/sermons?page=${pageNum - 1}`}
                variant="outline"
                size="sm"
              >
                Previous
              </LinkButton>
            )}
            <span className="text-sm text-current/60">
              Page {pageNum} of {totalPages}
            </span>
            {pageNum < totalPages && (
              <LinkButton
                href={`/sermons?page=${pageNum + 1}`}
                variant="outline"
                size="sm"
              >
                Next
              </LinkButton>
            )}
          </div>
        )}

        {settings.youtubeUrl && (
          <RevealSection className="mt-16 flex flex-col items-center gap-3 rounded-3xl bg-brand-700 px-6 py-10 text-center text-white sm:px-12">
            <h2 className="font-display text-2xl font-bold">Want to see more?</h2>
            <p className="max-w-md text-white/85">
              Every sermon we&apos;ve ever preached lives on our YouTube channel — full
              services, not just clips.
            </p>
            <LinkButton
              href={settings.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="secondary"
              size="lg"
            >
              View More on YouTube
            </LinkButton>
          </RevealSection>
        )}
      </Container>
    </section>
  );
}
