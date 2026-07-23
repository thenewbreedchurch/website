import type { Metadata } from "next";
import Image from "next/image";
import { prisma, type StaffMember, type ServiceTime } from "@nb-church/db";
import { getChurchSettings, getServiceTimes } from "@/lib/settings";
import { pageMetadata } from "@/lib/metadata";
import { Container } from "@/components/ui/container";
import { LinkButton } from "@/components/ui/link-button";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: "About Us",
    description:
      "The New Breed Church is a Redeemed Christian Church of God (RCCG) parish in Victoria Island, Lagos, raising a generation of believers rooted in the Word and alive in worship. Meet our leadership and see our weekly service times.",
    path: "/about",
    ogImage: "/images/about/about-sanctuary-interior.jpg",
  });
}

async function getLeadership(): Promise<StaffMember[]> {
  return prisma.staffMember.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}

const DAY_LABELS: Record<string, string> = {
  MON: "Mon",
  TUE: "Tue",
  WED: "Wed",
  THU: "Thu",
  FRI: "Fri",
  SAT: "Sat",
  SUN: "Sun",
};

function groupServiceTimes(serviceTimes: ServiceTime[]) {
  const byKey = new Map<string, { label: string; time: string; days: string[]; isOnline: boolean; onlineUrl: string | null }>();
  const order: string[] = [];

  for (const st of serviceTimes) {
    const key = `${st.label}|${st.startTime}|${st.endTime ?? ""}`;
    if (!byKey.has(key)) {
      const time = st.endTime ? `${st.startTime} - ${st.endTime}` : st.startTime;
      byKey.set(key, { label: st.label, time, days: [], isOnline: st.isOnline, onlineUrl: st.onlineUrl });
      order.push(key);
    }
    byKey.get(key)!.days.push(st.dayOfWeek);
  }

  return order.map((key) => {
    const entry = byKey.get(key)!;
    const dayLabel =
      entry.days.length >= 5 && entry.days.includes("MON") && entry.days.includes("SAT")
        ? "Mon - Sat"
        : entry.days.map((d) => DAY_LABELS[d] ?? d).join(", ");
    return { key, ...entry, dayLabel };
  });
}

function initials(name: string) {
  return name
    .split(" ")
    .filter((part) => part.length > 0 && part[0] === part[0].toUpperCase())
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default async function AboutPage() {
  const [settings, serviceTimes, leadership] = await Promise.all([
    getChurchSettings(),
    getServiceTimes(),
    getLeadership(),
  ]);

  const activities = groupServiceTimes(serviceTimes);

  return (
    <>
      <section className="relative flex min-h-[50vh] items-end overflow-hidden">
        <Image
          src="/images/about/about-sanctuary-interior.jpg"
          alt="The New Breed Church sanctuary"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
        <Container className="relative py-16 text-white">
          <h1 className="font-display text-4xl font-bold sm:text-5xl">Our Story</h1>
          <p className="mt-3 max-w-xl text-lg text-white/85">
            A New Breed of believers walking in the fullness of God&apos;s purpose — a parish
            of the Redeemed Christian Church of God (RCCG), raised up for young adults in
            Lagos and beyond.
          </p>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            <h2 className="font-display text-2xl font-bold sm:text-3xl">How New Breed Began</h2>
            <p className="mt-4 text-current/80 leading-relaxed">
              In 2020, a void emerged for young adults transitioning out of the Teens church —
              too old for one, and not quite at home in the main sanctuary. They needed a place
              to grow spiritually and serve purposefully.
            </p>
            <p className="mt-4 text-current/80 leading-relaxed">
              With the support of Pastor Idowu Iluyomade and Pastor Gbenga Olaniyan, The New
              Breed Church was born — a parish of the Redeemed Christian Church of God (RCCG),
              and a bridge for young believers discovering who they are in Christ and what
              they&apos;re called to do.
            </p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
            <Image
              src="/images/about/about-congregation-attentive.jpg"
              alt="Congregation attentive during service"
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 40vw, 100vw"
            />
          </div>
        </Container>
      </section>

      <section className="bg-surface-muted py-16 sm:py-20">
        <Container className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl lg:order-2">
            <Image
              src="/images/about/about-mission-worship.jpg"
              alt="Worship service at The New Breed Church"
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 40vw, 100vw"
            />
          </div>
          <div className="lg:order-1">
            <h2 className="font-display text-2xl font-bold sm:text-3xl">
              Worship is Our Lifestyle
            </h2>
            <p className="mt-4 text-current/80 leading-relaxed">
              We don&apos;t just worship on Sundays — worship is how we live. Every service is
              a moment to encounter God, build community, and be equipped for the week ahead.
            </p>
            <p className="mt-4 text-current/80 leading-relaxed">
              Our worship is youthful, spirit-led, and transformative.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            <h2 className="font-display text-2xl font-bold sm:text-3xl">Our Mission &amp; Vision</h2>
            <p className="mt-4 text-current/80 leading-relaxed">
              <span className="font-semibold text-current">Mission: </span>
              {settings.missionStatement}
            </p>
            <p className="mt-4 text-current/80 leading-relaxed">
              <span className="font-semibold text-current">Vision: </span>
              {settings.visionStatement}
            </p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
            <Image
              src="/images/about/about-vision-hall.jpg"
              alt="The New Breed Church gathering hall"
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 40vw, 100vw"
            />
          </div>
        </Container>
      </section>

      <section className="relative overflow-hidden py-20 sm:py-24">
        <Image
          src="/images/about/about-livestream-audience.jpg"
          alt="Congregation watching a livestreamed service"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-brand-900/80" />
        <Container className="relative flex flex-col items-center gap-4 text-center text-white">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">
            Watch Our Services Live
          </h2>
          <p className="max-w-lg text-white/85">
            Can&apos;t make it in person? Experience our services online from anywhere in the
            world via Mixlr.
          </p>
          {settings.livestreamUrl && (
            <LinkButton
              href={settings.livestreamUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="secondary"
              size="lg"
            >
              Join the Live Stream
            </LinkButton>
          )}
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Weekly Activities</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {activities.map((entry) => (
              <div
                key={entry.key}
                className="rounded-2xl border border-border bg-surface p-6 shadow-sm"
              >
                <h3 className="font-display text-lg font-semibold">{entry.label}</h3>
                <p className="mt-2 text-sm text-current/70">
                  {entry.dayLabel}
                  <br />
                  {entry.time}
                </p>
                {entry.isOnline && entry.onlineUrl && (
                  <a
                    href={entry.onlineUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-sm font-medium text-brand-700 hover:underline dark:text-brand-300"
                  >
                    Join Online
                  </a>
                )}
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-current/70">
            Sunday services meet in person at {settings.streetAddress}, {settings.addressLocality}
            , {settings.addressRegion}.
          </p>
        </Container>
      </section>

      <section className="bg-surface-muted py-16 sm:py-20">
        <Container>
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Leadership</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {leadership.map((member) => (
              <div
                key={member.id}
                className="flex flex-col items-center rounded-2xl border border-border bg-surface p-8 text-center shadow-sm"
              >
                {member.photoUrl ? (
                  <div className="relative h-28 w-28 overflow-hidden rounded-full">
                    <Image
                      src={member.photoUrl}
                      alt={member.name}
                      fill
                      className="object-cover"
                      sizes="112px"
                    />
                  </div>
                ) : (
                  <div className="flex h-28 w-28 items-center justify-center rounded-full bg-brand-100 text-2xl font-semibold text-brand-800 dark:bg-white/10 dark:text-white">
                    {initials(member.name)}
                  </div>
                )}
                <h3 className="mt-4 font-display text-lg font-semibold">{member.name}</h3>
                <p className="mt-1 text-sm text-current/70">{member.role}</p>
                {member.bio && (
                  <p className="mt-3 text-sm text-current/70 leading-relaxed">{member.bio}</p>
                )}
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container className="flex flex-col items-center gap-6 text-center">
          <div className="relative h-48 w-full max-w-2xl overflow-hidden rounded-2xl">
            <Image
              src="/images/about/about-scripture-hands.jpg"
              alt="Hands over an open Bible"
              fill
              className="object-cover"
              sizes="(min-width: 768px) 640px, 100vw"
            />
          </div>
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Visit Us</h2>
          <p className="max-w-lg text-current/80">
            We&apos;d love to have you join us in person or online. New here? Start with our
            First Timers guide to know exactly what to expect.
          </p>
          <LinkButton href="/first-timers" variant="primary" size="lg">
            Plan Your Visit
          </LinkButton>
        </Container>
      </section>
    </>
  );
}
