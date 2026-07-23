import type { Metadata } from "next";
import { prisma } from "@nb-church/db";
import { pageMetadata } from "@/lib/metadata";
import { Container } from "@/components/ui/container";
import { LinkButton } from "@/components/ui/link-button";
import { SermonCard } from "@/components/sermons/sermon-card";

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

  const [sermons, total] = await Promise.all([
    prisma.sermon.findMany({
      orderBy: { publishedAt: "desc" },
      take: PAGE_SIZE,
      skip: (pageNum - 1) * PAGE_SIZE,
    }),
    prisma.sermon.count(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <section className="py-16">
      <Container>
        <div className="max-w-2xl">
          <h1 className="font-display text-4xl font-bold sm:text-5xl">Sermons</h1>
          <p className="mt-3 text-lg text-current/70">
            Messages from our services — teaching to help you grow, wherever you are in
            your walk.
          </p>
        </div>

        {sermons.length === 0 ? (
          <p className="mt-10 text-current/70">
            Sermons are being added — check back soon, or watch live on our{" "}
            <a
              href="https://www.youtube.com/@the_newbreedchurch"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-brand-700 hover:underline dark:text-brand-300"
            >
              YouTube channel
            </a>
            .
          </p>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sermons.map((sermon, i) => (
              <SermonCard key={sermon.id} sermon={sermon} index={i} />
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
      </Container>
    </section>
  );
}
