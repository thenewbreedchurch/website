import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@nb-church/db";
import { pageMetadata } from "@/lib/metadata";
import { Container } from "@/components/ui/container";
import { LinkButton } from "@/components/ui/link-button";
import { youtubeEmbedUrl } from "@/lib/youtube";
import { RevealSection } from "@/components/journey/reveal-section";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const sermon = await prisma.sermon.findUnique({ where: { slug } });
  if (!sermon) return pageMetadata({ title: "Sermon not found", description: "", path: "/sermons" });

  return pageMetadata({
    title: sermon.title,
    description: sermon.description ?? `${sermon.title} — a message from ${sermon.speaker}.`,
    path: `/sermons/${sermon.slug}`,
    ogImage: sermon.thumbnailUrl ?? undefined,
  });
}

export default async function SermonDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const sermon = await prisma.sermon.findUnique({ where: { slug } });
  if (!sermon) notFound();

  const embedUrl = youtubeEmbedUrl(sermon.videoUrl);

  return (
    <article className="py-16">
      <Container className="max-w-3xl">
        <LinkButton href="/sermons" variant="ghost" size="sm" className="mb-6 -ml-3">
          &larr; All Sermons
        </LinkButton>

        <RevealSection>
        {embedUrl ? (
          <div className="relative aspect-video overflow-hidden rounded-2xl bg-black">
            <iframe
              src={embedUrl}
              title={sermon.title}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <a
            href={sermon.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-2xl border border-border bg-surface-muted p-6 text-center font-medium text-brand-700 hover:underline dark:text-brand-300"
          >
            Watch on YouTube &rarr;
          </a>
        )}

        <div className="mt-8">
          {sermon.series && (
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
              {sermon.series}
            </p>
          )}
          <h1 className="mt-1 font-display text-3xl font-bold sm:text-4xl">{sermon.title}</h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-current/70">
            <span>{sermon.speaker}</span>
            <span aria-hidden>&middot;</span>
            <span>
              {sermon.publishedAt.toLocaleDateString("en-NG", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            {sermon.scripture && (
              <>
                <span aria-hidden>&middot;</span>
                <span>{sermon.scripture}</span>
              </>
            )}
          </div>

          {sermon.description && (
            <p className="mt-6 whitespace-pre-line leading-relaxed text-current/85">
              {sermon.description}
            </p>
          )}

          {sermon.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {sermon.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-800 dark:bg-white/10 dark:text-brand-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        </RevealSection>
      </Container>
    </article>
  );
}
