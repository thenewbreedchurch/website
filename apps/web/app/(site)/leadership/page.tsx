import type { Metadata } from "next";
import Image from "next/image";
import { Mail, Phone } from "lucide-react";
import { prisma } from "@nb-church/db";
import { pageMetadata } from "@/lib/metadata";
import { initials } from "@/lib/utils";
import { Container } from "@/components/ui/container";
import { RevealSection } from "@/components/journey/reveal-section";
import { TiltCard } from "@/components/journey/tilt-card";

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
      <section className="bg-brand-900 py-16 text-white">
        <Container className="max-w-2xl">
          <h1 className="font-display text-4xl font-bold sm:text-5xl">Our Leadership</h1>
          <p className="mt-3 text-lg text-white/85">
            Not sure who to talk to about baptism, joining a team, or just getting connected?
            Find the right person below and reach out directly.
          </p>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          {leaders.length === 0 ? (
            <RevealSection className="text-center text-current/70">
              We&apos;re updating this page — in the meantime,{" "}
              <a href="/contact" className="font-medium text-brand-700 hover:underline dark:text-brand-300">
                reach out to us directly
              </a>
              .
            </RevealSection>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {leaders.map((leader) => (
                <TiltCard
                  key={leader.id}
                  className="flex flex-col items-center rounded-2xl border border-border bg-surface p-8 text-center shadow-sm"
                >
                  {leader.photoUrl ? (
                    <div className="relative h-28 w-28 overflow-hidden rounded-full">
                      <Image
                        src={leader.photoUrl}
                        alt={leader.name}
                        fill
                        className="object-cover"
                        sizes="112px"
                      />
                    </div>
                  ) : (
                    <div className="flex h-28 w-28 items-center justify-center rounded-full bg-brand-100 text-2xl font-semibold text-brand-800 dark:bg-white/10 dark:text-white">
                      {initials(leader.name)}
                    </div>
                  )}
                  <h2 className="mt-4 font-display text-lg font-semibold">{leader.name}</h2>
                  <p className="mt-1 text-sm text-current/70">{leader.role}</p>
                  {leader.department && (
                    <p className="mt-1 text-xs font-medium uppercase tracking-wide text-brand-700 dark:text-brand-300">
                      {leader.department}
                    </p>
                  )}
                  {leader.bio && (
                    <p className="mt-3 text-sm leading-relaxed text-current/70">{leader.bio}</p>
                  )}

                  {(leader.email || leader.phone) && (
                    <div className="mt-5 flex flex-col items-center gap-1.5 text-sm">
                      {leader.email && (
                        <a
                          href={`mailto:${leader.email}`}
                          className="flex items-center gap-1.5 font-medium text-brand-700 hover:underline dark:text-brand-300"
                        >
                          <Mail size={14} /> {leader.email}
                        </a>
                      )}
                      {leader.phone && (
                        <a
                          href={`tel:${leader.phone.replace(/\s+/g, "")}`}
                          className="flex items-center gap-1.5 font-medium text-brand-700 hover:underline dark:text-brand-300"
                        >
                          <Phone size={14} /> {leader.phone}
                        </a>
                      )}
                    </div>
                  )}
                </TiltCard>
              ))}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
