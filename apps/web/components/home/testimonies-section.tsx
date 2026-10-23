import { prisma } from "@nb-church/db";
import { SectionBand } from "@/components/ui/section-band";
import { Eyebrow } from "@/components/ui/eyebrow";
import { StaggeredHeading } from "@/components/ui/staggered-heading";
import { TestimonyReveal } from "./testimony-reveal";

export async function TestimoniesSection({ testimonyEmail }: { testimonyEmail: string }) {
  const testimonies = await prisma.testimony.findMany({
    where: { isApproved: true },
    orderBy: { publishedAt: "desc" },
    take: 3,
  });

  const cta =
    "inline-flex items-center justify-center bg-brand-700 px-8 py-4 text-sm font-bold uppercase tracking-tight text-white transition-colors hover:bg-brand-800";

  return (
    <SectionBand tone="white">
      <Eyebrow className="text-brand-700 dark:text-brand-300">Testimonies</Eyebrow>
      <StaggeredHeading
        className="mt-6"
        lines={["God is", "at work"]}
        haloLine={1}
        haloClassName="text-brand-600"
      />
      <p className="t-body mt-6 max-w-md text-current/70">
        See how God is transforming lives at The New Breed Church.
      </p>

      {testimonies.length > 0 ? (
        <>
          <TestimonyReveal
            testimonies={testimonies.map((t) => ({
              id: t.id,
              authorName: t.authorName,
              body: t.body,
            }))}
          />
          <a href={`mailto:${testimonyEmail}`} className={`mt-12 ${cta}`}>
            Share Your Testimony
          </a>
        </>
      ) : (
        <div className="mt-10 border border-dashed border-border p-10">
          <p className="text-current/70">
            We&apos;d love to hear how God has been at work in your life.
          </p>
          <a href={`mailto:${testimonyEmail}`} className={`mt-6 ${cta}`}>
            Share Your Testimony
          </a>
        </div>
      )}
    </SectionBand>
  );
}
