import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import { prisma } from "@nb-church/db";

export async function SermonsTeaser() {
  const sermons = await prisma.sermon.findMany({
    orderBy: { publishedAt: "desc" },
    take: 3,
  });

  return (
    <section className="bg-surface-muted py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">Latest Sermons</h2>
            <p className="mt-2 text-current/70">Catch up on the Word, wherever you are.</p>
          </div>
          <Link
            href="/sermons"
            className="text-sm font-medium text-brand-700 hover:underline dark:text-brand-300"
          >
            View All Sermons &rarr;
          </Link>
        </div>

        {sermons.length > 0 ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sermons.map((sermon) => (
              <a
                key={sermon.id}
                href={sermon.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="relative aspect-video overflow-hidden">
                  {sermon.thumbnailUrl ? (
                    <Image
                      src={sermon.thumbnailUrl}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-full w-full bg-brand-100 dark:bg-white/10" />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-brand-700">
                      <Play size={20} fill="currentColor" />
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-display text-lg font-semibold">{sermon.title}</h3>
                  <p className="mt-1 text-sm text-current/70">
                    {sermon.speaker} &middot;{" "}
                    {sermon.publishedAt.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  {sermon.scripture && (
                    <p className="mt-2 text-sm font-medium text-brand-700 dark:text-brand-300">
                      {sermon.scripture}
                    </p>
                  )}
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
            <p className="text-current/70">Sermons coming soon — check back shortly.</p>
          </div>
        )}
      </div>
    </section>
  );
}
