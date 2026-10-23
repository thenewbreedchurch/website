import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import { prisma } from "@nb-church/db";
import { getChurchSettings } from "@/lib/settings";
import { pageMetadata } from "@/lib/metadata";
import { youtubeThumbnailUrl, SERMON_FALLBACK_THUMBNAILS } from "@/lib/youtube";
import { SectionBand } from "@/components/ui/section-band";
import { PageHero } from "@/components/ui/page-hero";
import { RuledRow } from "@/components/ui/ruled-row";
import { TextLink } from "@/components/ui/text-link";
import { LinkButton } from "@/components/ui/link-button";

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
  const [featured, ...rest] = sermons;
  const featuredThumb = featured
    ? (featured.thumbnailUrl ??
      youtubeThumbnailUrl(featured.videoUrl) ??
      SERMON_FALLBACK_THUMBNAILS[0])
    : null;
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  return (
    <>
      <PageHero
        eyebrow="Sermons"
        lines={["Watch", "the message"]}
        image="/images/sermons/sermons-preaching-1.jpg"
        description="Messages from our services — teaching to help you grow, wherever you are in your walk."
      />

      <SectionBand tone="night" className="!pt-0">
        {!featured ? (
          <p className="t-body text-white/70">
            Sermons are being added — check back soon, or watch live on our{" "}
            {settings.youtubeUrl ? (
              <a href={settings.youtubeUrl} target="_blank" rel="noopener noreferrer" className="font-semibold underline">
                YouTube channel
              </a>
            ) : (
              "YouTube channel"
            )}
            .
          </p>
        ) : (
          <>
            {pageNum === 1 && (
              <Link
                href={`/sermons/${featured.slug}`}
                className="group grid gap-8 lg:grid-cols-[1fr_20rem]"
              >
                <div className="relative aspect-video overflow-hidden">
                  <Image
                    src={featuredThumb!}
                    alt=""
                    fill
                    priority
                    sizes="(min-width: 1024px) 70vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/25">
                    <span className="inline-flex h-16 w-16 items-center justify-center bg-brand-600 text-white transition-colors group-hover:bg-brand-500">
                      <Play size={24} fill="currentColor" />
                    </span>
                  </span>
                </div>
                <div className="flex flex-col justify-end">
                  <p className="t-eyebrow text-brand-300">Latest</p>
                  <h2 className="mt-3 font-display text-3xl font-bold uppercase leading-none tracking-tight">
                    {featured.title}
                  </h2>
                  <p className="t-eyebrow mt-4 text-white/65">
                    {featured.speaker} · {fmt(featured.publishedAt)}
                  </p>
                </div>
              </Link>
            )}

            <div className={pageNum === 1 ? "mt-16" : ""}>
              {(pageNum === 1 ? rest : sermons).map((s) => (
                <RuledRow key={s.id}>
                  <Link
                    href={`/sermons/${s.slug}`}
                    className="font-display text-xl font-bold uppercase tracking-tight transition-colors hover:text-brand-300 sm:text-3xl"
                  >
                    {s.title}
                  </Link>
                  <p className="t-eyebrow text-white/65">
                    {s.speaker} · {fmt(s.publishedAt)}
                    {s.scripture ? ` · ${s.scripture}` : ""}
                  </p>
                </RuledRow>
              ))}
            </div>
          </>
        )}

        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-4">
            {pageNum > 1 && (
              <LinkButton href={`/sermons?page=${pageNum - 1}`} variant="outline" size="sm" shape="square">
                Previous
              </LinkButton>
            )}
            <span className="t-eyebrow text-white/60">
              Page {pageNum} of {totalPages}
            </span>
            {pageNum < totalPages && (
              <LinkButton href={`/sermons?page=${pageNum + 1}`} variant="outline" size="sm" shape="square">
                Next
              </LinkButton>
            )}
          </div>
        )}
      </SectionBand>

      {settings.youtubeUrl && (
        <SectionBand tone="violet" className="text-center">
          <h2 className="t-display-sm">Want to see more?</h2>
          <p className="t-body mx-auto mt-5 max-w-md text-white/85">
            Experience more teaching and worship on our YouTube channel — full services, whenever
            you need one.
          </p>
          <div className="mt-8 flex justify-center [--link-accent:var(--color-white)]">
            <TextLink href={settings.youtubeUrl} external>
              Watch on YouTube
            </TextLink>
          </div>
        </SectionBand>
      )}
    </>
  );
}
