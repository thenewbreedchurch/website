import { prisma } from "@nb-church/db";
import { TestimonyReveal } from "./testimony-reveal";

export async function TestimoniesSection({ testimonyEmail }: { testimonyEmail: string }) {
  const testimonies = await prisma.testimony.findMany({
    where: { isApproved: true },
    orderBy: { publishedAt: "desc" },
    take: 3,
  });

  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="font-display text-3xl font-bold sm:text-4xl">Testimonies</h2>
        <p className="mt-2 text-current/70">
          See how God is transforming lives at The New Breed Church
        </p>

        {testimonies.length > 0 ? (
          <>
            <div className="text-left">
              <TestimonyReveal
                testimonies={testimonies.map((t) => ({
                  id: t.id,
                  authorName: t.authorName,
                  body: t.body,
                }))}
              />
            </div>
            <a
              href={`mailto:${testimonyEmail}`}
              className="mt-10 inline-flex h-12 items-center justify-center rounded-full bg-brand-700 px-8 text-sm font-medium text-white transition-colors hover:bg-brand-800"
            >
              Share Your Testimony
            </a>
          </>
        ) : (
          <div className="mt-10 rounded-2xl border border-dashed border-border bg-surface-muted p-10">
            <p className="text-current/70">
              We&apos;d love to hear how God has been at work in your life.
            </p>
            <a
              href={`mailto:${testimonyEmail}`}
              className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-brand-700 px-8 text-sm font-medium text-white transition-colors hover:bg-brand-800"
            >
              Share Your Testimony
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
