import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@nb-church/db";
import { pageMetadata } from "@/lib/metadata";
import { SectionBand } from "@/components/ui/section-band";
import { Eyebrow } from "@/components/ui/eyebrow";
import { TextLink } from "@/components/ui/text-link";
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
    <article>
      <SectionBand tone="night" className="!pb-20">
        <TextLink href="/sermons" className="mb-10 !border-b-0 [&>svg]:hidden">
          &larr; All sermons
        </TextLink>

        <RevealSection className="max-w-5xl">
          {embedUrl ? (
            <div className="relative aspect-video overflow-hidden bg-black">
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
              className="t-link"
            >
              Watch on YouTube
            </a>
          )}

          <div className="mt-12">
            {sermon.series && <Eyebrow>{sermon.series}</Eyebrow>}
            <h1 className="t-display-sm mt-4">{sermon.title}</h1>

            <p className="t-eyebrow mt-6 text-white/65">
              {sermon.speaker} ·{" "}
              {sermon.publishedAt.toLocaleDateString("en-NG", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
              {sermon.scripture ? ` · ${sermon.scripture}` : ""}
            </p>

            {sermon.description && (
              <p className="t-body mt-8 max-w-2xl whitespace-pre-line text-base text-white/85">
                {sermon.description}
              </p>
            )}

            {sermon.tags.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2">
                {sermon.tags.map((tag) => (
                  <span key={tag} className="t-eyebrow border border-white/25 px-3 py-2 text-white/80">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </RevealSection>
      </SectionBand>
    </article>
  );
}
