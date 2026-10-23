import { SermonThumb } from "@/components/home/sermon-thumb";
import { Play } from "lucide-react";
import { prisma } from "@nb-church/db";
import { youtubeThumbnailUrl, SERMON_FALLBACK_THUMBNAILS } from "@/lib/youtube";
import { SectionBand } from "@/components/ui/section-band";
import { Eyebrow } from "@/components/ui/eyebrow";
import { StaggeredHeading } from "@/components/ui/staggered-heading";
import { RuledRow } from "@/components/ui/ruled-row";
import { TextLink } from "@/components/ui/text-link";

export async function SermonsTeaser() {
  const sermons = await prisma.sermon.findMany({
    orderBy: { publishedAt: "desc" },
    take: 4,
  });
  const [latest, ...rest] = sermons;
  const thumb = (s: (typeof sermons)[number], i: number) =>
    s.thumbnailUrl ??
    youtubeThumbnailUrl(s.videoUrl) ??
    SERMON_FALLBACK_THUMBNAILS[i % SERMON_FALLBACK_THUMBNAILS.length];

  return (
    <SectionBand tone="night">
      <Eyebrow>Sermon</Eyebrow>
      <StaggeredHeading
        className="mt-6"
        lines={["Watch latest", "message"]}
        haloLine={1}
        haloClassName="text-brand-400"
      />

      {latest ? (
        <>
          <div className="mt-14 grid gap-10 lg:grid-cols-[18rem_1fr]">
            <div className="flex flex-col justify-between gap-8">
              <div>
                <h3 className="font-display text-2xl font-bold leading-tight">{latest.title}</h3>
                <p className="t-body mt-3 text-sm text-white/70">
                  {latest.speaker} &middot;{" "}
                  {latest.publishedAt.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                {latest.scripture && (
                  <p className="t-eyebrow mt-4 text-brand-300">{latest.scripture}</p>
                )}
              </div>
              <TextLink href="/sermons">All sermons</TextLink>
            </div>

            <a
              href={latest.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block aspect-video overflow-hidden"
              aria-label={`Watch ${latest.title}`}
            >
              <SermonThumb
                src={
                  latest.thumbnailUrl ??
                  youtubeThumbnailUrl(latest.videoUrl, "maxresdefault") ??
                  thumb(latest, 0)
                }
                fallbackSrc={thumb(latest, 0)}
                sizes="(min-width: 1024px) 70vw, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <span className="absolute inset-0 flex items-center justify-center bg-black/25">
                <span className="inline-flex h-16 w-16 items-center justify-center bg-brand-600 text-white transition-colors group-hover:bg-brand-500">
                  <Play size={24} fill="currentColor" />
                </span>
              </span>
            </a>
          </div>

          {rest.length > 0 && (
            <div className="mt-16">
              {rest.map((s) => (
                <RuledRow key={s.id}>
                  <a
                    href={s.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-display text-xl font-bold uppercase tracking-tight transition-colors hover:text-brand-300 sm:text-3xl"
                  >
                    {s.title}
                  </a>
                  <p className="t-eyebrow text-white/65">
                    {s.speaker} · {s.publishedAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </RuledRow>
              ))}
            </div>
          )}
        </>
      ) : (
        <p className="t-body mt-14 border border-dashed border-white/25 p-10 text-center text-white/70">
          Sermons coming soon — check back shortly.
        </p>
      )}
    </SectionBand>
  );
}
