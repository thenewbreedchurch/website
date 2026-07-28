import type { Metadata } from "next";
import Image from "next/image";
import { Mail, Phone } from "lucide-react";
import { prisma, type StaffMember } from "@nb-church/db";
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

function LeaderCard({ leader, priority = false }: { leader: StaffMember; priority?: boolean }) {
  return (
    <TiltCard>
      <div className="group overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        <div className="relative aspect-[4/5] overflow-hidden bg-brand-50 dark:bg-white/5">
          {leader.photoUrl ? (
            <Image
              src={leader.photoUrl}
              alt={leader.name}
              fill
              priority={priority}
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-5xl font-semibold text-brand-800 dark:text-white">
              {initials(leader.name)}
            </div>
          )}
        </div>

        <div className="p-6 text-center">
          <h2 className="font-display text-lg font-semibold">{leader.name}</h2>
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
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              {leader.email && (
                <a
                  href={`mailto:${leader.email}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-muted px-3.5 py-1.5 text-xs font-medium text-brand-700 transition-colors hover:border-brand-300 hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-white/10"
                >
                  <Mail size={13} /> Email
                </a>
              )}
              {leader.phone && (
                <a
                  href={`tel:${leader.phone.replace(/\s+/g, "")}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-muted px-3.5 py-1.5 text-xs font-medium text-brand-700 transition-colors hover:border-brand-300 hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-white/10"
                >
                  <Phone size={13} /> Call
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </TiltCard>
  );
}

export default async function LeadershipPage() {
  const leaders = await prisma.staffMember.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <>
      <section className="bg-brand-900 py-16 text-white sm:py-20">
        <Container className="max-w-2xl">
          <h1 className="font-display text-4xl font-bold sm:text-5xl">Our Leadership</h1>
          <p className="mt-3 text-lg text-white/85">
            Not sure who to talk to about baptism, joining a team, or just getting connected?
            Find the right person below and reach out directly.
          </p>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
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
              {leaders.map((leader, index) => (
                <LeaderCard key={leader.id} leader={leader} priority={index === 0} />
              ))}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
