import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { prisma } from "@nb-church/db";
import { initials } from "@/lib/utils";
import { SectionBand } from "@/components/ui/section-band";
import { Eyebrow } from "@/components/ui/eyebrow";
import { StaggeredHeading } from "@/components/ui/staggered-heading";
import { TextLink } from "@/components/ui/text-link";

const SHOWN = 5;

/**
 * The leadership is a team (no single lead pastor), so the home page shows the
 * first five by sortOrder and, when there are more, a sixth "meet the rest"
 * tile that completes a clean 3×2 grid.
 */
export async function LeadershipTeaser() {
  // One extra row tells us whether anyone is left to link to.
  const leaders = await prisma.staffMember.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    take: SHOWN + 1,
  });

  if (leaders.length === 0) return null;

  const shown = leaders.slice(0, SHOWN);
  const hasMore = leaders.length > SHOWN;

  return (
    <SectionBand tone="white">
      <Eyebrow className="text-brand-700 dark:text-brand-300">Leadership</Eyebrow>
      <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
        <StaggeredHeading
          lines={["Meet our", "leaders"]}
          haloLine={1}
          haloClassName="text-brand-600"
        />
        {!hasMore && <TextLink href="/leadership">All leadership</TextLink>}
      </div>

      <ul className="mt-14 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-3 lg:gap-x-6">
        {shown.map((leader) => (
          <li key={leader.id}>
            <Link href="/leadership" className="group block">
              <div className="relative aspect-[4/5] overflow-hidden bg-brand-50 dark:bg-white/5">
                {leader.photoUrl ? (
                  <Image
                    src={leader.photoUrl}
                    alt={leader.name}
                    fill
                    sizes="(min-width: 1024px) 30vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center font-display text-6xl font-bold text-brand-700 dark:text-white">
                    {initials(leader.name)}
                  </div>
                )}
              </div>
              <h3 className="mt-4 font-display text-xl font-bold uppercase leading-none tracking-tight sm:text-2xl">
                {leader.name}
              </h3>
              <p className="t-eyebrow mt-2 text-brand-700 dark:text-brand-300">
                {leader.department ?? leader.role}
              </p>
            </Link>
          </li>
        ))}

        {hasMore && (
          <li>
            <Link
              href="/leadership"
              className="group flex h-full min-h-[16rem] flex-col justify-between bg-brand-700 p-6 text-white transition-colors hover:bg-brand-800 sm:p-8"
            >
              <p className="t-eyebrow text-white/80">The full team</p>
              <span className="flex items-end justify-between gap-4">
                <span className="t-display-sm !text-[clamp(1.75rem,3.2vw,2.75rem)]">
                  Meet the rest
                </span>
                <ArrowUpRight
                  aria-hidden="true"
                  className="size-8 shrink-0 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 sm:size-10"
                />
              </span>
            </Link>
          </li>
        )}
      </ul>
    </SectionBand>
  );
}
