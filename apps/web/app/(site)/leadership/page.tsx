import type { Metadata } from "next";
import Image from "next/image";
import { prisma } from "@nb-church/db";
import { pageMetadata } from "@/lib/metadata";
import { initials } from "@/lib/utils";
import { SectionBand } from "@/components/ui/section-band";
import { PageHero } from "@/components/ui/page-hero";
import { TextLink } from "@/components/ui/text-link";

export function generateMetadata(): Metadata {
  return pageMetadata({
    title: "Leadership",
    description:
      "Meet the pastors and leaders of The New Breed Church, and find the right person to reach out to for baptism, discipleship, and getting connected.",
    path: "/leadership",
  });
}

export default async function LeadershipPage() {
  const leaders = await prisma.staffMember.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <>
      <PageHero
        eyebrow="Leadership"
        lines={["Our", "leadership team"]}
        description="Not sure who to talk to about baptism, joining a team, or just getting connected? Find the right person below and reach out directly."
      />

      <SectionBand tone="white">
        {leaders.length === 0 ? (
          <p className="text-current/70">
            We&apos;re updating this page — in the meantime,{" "}
            <a href="/contact" className="font-semibold underline">
              reach out to us directly
            </a>
            .
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-x-4 gap-y-14 lg:grid-cols-4 lg:gap-x-6">
            {leaders.map((leader, index) => (
              <li key={leader.id}>
                <div className="relative aspect-[4/5] overflow-hidden bg-brand-50 dark:bg-white/5">
                  {leader.photoUrl ? (
                    <Image
                      src={leader.photoUrl}
                      alt={leader.name}
                      fill
                      priority={index < 4}
                      sizes="(min-width: 1024px) 25vw, 50vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center font-display text-6xl font-bold text-brand-700 dark:text-white">
                      {initials(leader.name)}
                    </div>
                  )}
                </div>
                <h2 className="mt-4 font-display text-xl font-bold uppercase leading-none tracking-tight sm:text-2xl">
                  {leader.name}
                </h2>
                <p className="t-eyebrow mt-2 text-brand-700 dark:text-brand-300">
                  {leader.role}
                  {leader.department ? ` · ${leader.department}` : ""}
                </p>
                {leader.bio && (
                  <p className="t-body mt-3 text-sm text-current/70">{leader.bio}</p>
                )}
                {(leader.email || leader.phone) && (
                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-3">
                    {leader.email && (
                      <TextLink href={`mailto:${leader.email}`} prefetch={false}>
                        Email
                      </TextLink>
                    )}
                    {leader.phone && (
                      <TextLink href={`tel:${leader.phone.replace(/\s+/g, "")}`} prefetch={false}>
                        Call
                      </TextLink>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </SectionBand>
    </>
  );
}
