import type { Metadata } from "next";
import Image from "next/image";
import type { ServiceTime } from "@nb-church/db";
import { getChurchSettings, getServiceTimes } from "@/lib/settings";
import { pageMetadata } from "@/lib/metadata";
import { SectionBand } from "@/components/ui/section-band";
import { Eyebrow } from "@/components/ui/eyebrow";
import { StaggeredHeading } from "@/components/ui/staggered-heading";
import { RuledRow } from "@/components/ui/ruled-row";
import { TextLink } from "@/components/ui/text-link";
import { RevealSection } from "@/components/journey/reveal-section";
import { LeadershipTeaser } from "@/components/home/leadership-teaser";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: "About Us",
    description:
      "The New Breed Church is a Redeemed Christian Church of God (RCCG) parish in Victoria Island, Lagos, raising a generation of believers rooted in the Word and alive in worship. Meet our leadership and see our weekly service times.",
    path: "/about",
    ogImage: "/images/about/about-sanctuary-interior.jpg",
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

export default async function AboutPage() {
  const [settings, serviceTimes] = await Promise.all([
    getChurchSettings(),
    getServiceTimes(),
  ]);

  const activities = groupServiceTimes(serviceTimes);

  return (
    <>
      <section className="relative isolate flex min-h-[70vh] items-end overflow-hidden bg-night text-white">
        <Image
          src="/images/about/about-sanctuary-interior.jpg"
          alt="The New Breed Church sanctuary"
          fill
          priority
          className="-z-10 object-cover"
          sizes="100vw"
          style={{ objectPosition: "50% 55%" }}
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-night via-night/50 to-night/10" />
        <div className="px-4 pb-16 pt-32 sm:px-6 lg:px-9">
          <Eyebrow>About us</Eyebrow>
          <StaggeredHeading as="h1" className="mt-6" lines={["Our", "story"]} haloLine={1} />
          <p className="t-body mt-8 max-w-xl text-base text-white/85 sm:text-lg">
            A New Breed of believers walking in the fullness of God&apos;s purpose — a parish of
            the Redeemed Christian Church of God (RCCG), raised up for young adults in Lagos and
            beyond.
          </p>
        </div>
      </section>

      <section className="grid lg:grid-cols-2">
        <SectionBand tone="white">
          <Eyebrow className="text-brand-700 dark:text-brand-300">How it began</Eyebrow>
          <StaggeredHeading className="mt-6" size="sm" lines={["How", "new breed", "began"]} haloLine={2} haloClassName="text-brand-600" />
          <div className="t-body mt-8 max-w-md space-y-4 text-base text-current/80">
            <p>
              In 2020, a void emerged for young adults transitioning out of the Teens church — too
              old for one, and not quite at home in the main sanctuary. They needed a place to grow
              spiritually and serve purposefully.
            </p>
            <p>
              With the support of Pastor Idowu Iluyomade and Pastor Gbenga Olaniyan, The New Breed
              Church was born — a parish of the Redeemed Christian Church of God (RCCG), and a
              bridge for young believers discovering who they are in Christ and what they&apos;re
              called to do.
            </p>
          </div>
        </SectionBand>
        <RevealSection className="relative min-h-[22rem]">
          <Image src="/images/about/about-congregation-attentive.jpg" alt="Congregation attentive during service" fill className="object-cover" sizes="(min-width: 1024px) 50vw, 100vw" />
        </RevealSection>
      </section>

      <section className="grid lg:grid-cols-2">
        <SectionBand tone="night" className="lg:order-2">
          <Eyebrow>Worship</Eyebrow>
          <StaggeredHeading className="mt-6" size="sm" lines={["Worship is", "our lifestyle"]} haloLine={1} />
          <div className="t-body mt-8 max-w-md space-y-4 text-base text-white/85">
            <p>
              We don&apos;t just worship on Sundays — worship is how we live. Every service is a
              moment to encounter God, build community, and be equipped for the week ahead.
            </p>
            <p>Our worship is youthful, spirit-led, and transformative.</p>
          </div>
        </SectionBand>
        <RevealSection className="relative min-h-[22rem] lg:order-1">
          <Image src="/images/hero/hero-worship-vocals.jpg" alt="Worship vocalist leading praise at The New Breed Church" fill className="object-cover" sizes="(min-width: 1024px) 50vw, 100vw" />
        </RevealSection>
      </section>

      <section className="grid lg:grid-cols-2">
        <SectionBand tone="violet">
          <Eyebrow className="text-white/80">Purpose</Eyebrow>
          <StaggeredHeading className="mt-6" size="sm" lines={["Our mission", "& vision"]} haloLine={1} haloClassName="text-white" />
          <div className="t-body mt-8 max-w-md space-y-4 text-base text-white/90">
            <p>
              <span className="font-bold">Mission: </span>
              {settings.missionStatement}
            </p>
            <p>
              <span className="font-bold">Vision: </span>
              {settings.visionStatement}
            </p>
          </div>
        </SectionBand>
        <RevealSection className="relative min-h-[22rem]">
          <Image src="/images/about/about-vision-hall.jpg" alt="The New Breed Church gathering hall" fill className="object-cover" sizes="(min-width: 1024px) 50vw, 100vw" />
        </RevealSection>
      </section>

      <section className="relative isolate overflow-hidden bg-brand-950 text-white">
        <Image
          src="/images/about/about-livestream-audience.jpg"
          alt="Congregation watching a livestreamed service"
          fill
          className="-z-10 object-cover opacity-40"
          style={{ objectPosition: "50% 30%" }}
          sizes="100vw"
        />
        <RevealSection className="px-4 py-28 text-center sm:px-6 sm:py-36 lg:px-9">
          <StaggeredHeading size="sm" align="center" lines={["Watch our", "services live"]} haloLine={1} />
          <p className="t-body mx-auto mt-6 max-w-lg text-white/85">
            Can&apos;t make it in person? Experience our services online from anywhere in the world
            on YouTube.
          </p>
          {settings.livestreamUrl && (
            <div className="mt-8 flex justify-center">
              <TextLink href={settings.livestreamUrl} external>
                Join the live stream
              </TextLink>
            </div>
          )}
        </RevealSection>
      </section>

      <SectionBand tone="white" id="weekly" className="scroll-mt-20">
        <Eyebrow className="text-brand-700 dark:text-brand-300">Weekly</Eyebrow>
        <StaggeredHeading className="mt-6" size="sm" lines={["Weekly", "activities"]} haloLine={1} haloClassName="text-brand-600" />
        <div className="mt-12">
          {activities.map((entry) => (
            <RuledRow key={entry.key}>
              <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
                <h3 className="font-display text-2xl font-bold uppercase leading-none tracking-tight sm:text-4xl">
                  {entry.label}
                </h3>
                <p className="t-eyebrow text-current/65">
                  {entry.dayLabel} · {entry.time}
                </p>
              </div>
              {entry.isOnline && entry.onlineUrl && (
                <TextLink href={entry.onlineUrl} external>
                  Join online
                </TextLink>
              )}
            </RuledRow>
          ))}
        </div>
        <p className="t-body mt-8 text-sm text-current/70">
          Sunday services meet in person at {settings.streetAddress}, {settings.addressLocality},{" "}
          {settings.addressRegion}.
        </p>
      </SectionBand>

      <LeadershipTeaser />

      {/* "Welcome Home" is a designed graphic — the vertical crop anchored to the bottom removes
          its small circular badge on every screen size (it ends ~10.6% down the source frame; the
          headline starts ~20%). Do not re-crop this file. */}
      <section className="relative overflow-hidden">
        <div className="relative aspect-[2/1] w-full">
          <Image
            src="/images/about/about-visit-us-welcome-home.jpg"
            alt="Welcome Home — join us at The New Breed Church"
            fill
            className="object-cover"
            style={{ objectPosition: "50% 100%" }}
            sizes="100vw"
          />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-night/80 to-transparent" />
          <RevealSection className="absolute inset-x-0 bottom-0 flex justify-center pb-4 text-white sm:pb-8">
            <TextLink href="/first-timers">Plan your visit</TextLink>
          </RevealSection>
        </div>
      </section>
    </>
  );
}
