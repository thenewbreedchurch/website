import Image from "next/image";
import type { Metadata } from "next";
import { getChurchSettings, getServiceTimes } from "@/lib/settings";
import { pageMetadata } from "@/lib/metadata";
import { Eyebrow } from "@/components/ui/eyebrow";
import { StaggeredHeading } from "@/components/ui/staggered-heading";
import { TextLink } from "@/components/ui/text-link";
import { HeroVideo } from "@/components/home/hero-video";
import { WeeklyActivities } from "@/components/home/weekly-activities";
import { BeliefCarousel, type BeliefSlide } from "@/components/home/belief-carousel";
import { TestimoniesSection } from "@/components/home/testimonies-section";
import { UpcomingEvents } from "@/components/home/upcoming-events";
import { LeadershipTeaser } from "@/components/home/leadership-teaser";
import { SermonsTeaser } from "@/components/home/sermons-teaser";
import { NewsletterForm } from "@/components/home/newsletter-form";

const STRIP_IMAGES = [
  "/images/general/general-worship-vocals-1.jpg",
  "/images/general/general-congregation-seated.jpg",
  "/images/general/general-worship-team.jpg",
  "/images/general/general-worship-portrait.jpg",
];

// Drawn from the church's own mission and tagline ("rooted in the Word, alive in
// worship, committed to serving God and their community"; "grow in faith, hope,
// and love"). Edit freely — the highlighted word gets the hand-drawn circle.
const BELIEF_SLIDES: BeliefSlide[] = [
  { before: "We are a ", mark: "new breed" },
  { before: "We are rooted in the ", mark: "Word", long: true },
  { before: "We are alive in ", mark: "worship" },
  { before: "We love ", mark: "God", after: " and we love people", long: true },
  { before: "We grow in ", mark: "faith" },
  { before: "We stand on ", mark: "hope" },
  { before: "We walk in ", mark: "love" },
  { before: "We are committed to ", mark: "serving", long: true },
  { before: "We love our ", mark: "community" },
  { before: "We raise a ", mark: "generation", after: " of believers", long: true },
];

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getChurchSettings();
  return pageMetadata({
    title: `${settings.orgName} — ${settings.tagline}`,
    description:
      "A vibrant Christian community in Lagos, Nigeria. Join our Sunday services, Bible studies, worship, and community outreach. Growing in faith, serving with love.",
    path: "/",
  });
}

export default async function Home() {
  const [settings, serviceTimes] = await Promise.all([
    getChurchSettings(),
    getServiceTimes(),
  ]);

  return (
    <>
      <HeroVideo
        orgName={settings.orgName}
        ctaLabel="Join Us Sunday"
        ctaHref={settings.livestreamUrl ?? "/first-timers"}
        external={Boolean(settings.livestreamUrl)}
      />

      <BeliefCarousel
        left={settings.missionStatement}
        right={settings.tagline}
        slides={BELIEF_SLIDES}
      />

      {/* Edge-to-edge photo strip, no gutters or gaps. */}
      <section aria-hidden="true" className="grid h-64 grid-cols-2 sm:h-96 lg:h-[30rem] lg:grid-cols-[1fr_1fr_1.6fr_1.2fr]">
        {STRIP_IMAGES.map((src, i) => (
          <div key={src} className={`relative ${i > 1 ? "hidden lg:block" : ""}`}>
            <Image src={src} alt="" fill sizes="(min-width: 1024px) 30vw, 50vw" className="object-cover" />
          </div>
        ))}
      </section>

      <SermonsTeaser />

      <UpcomingEvents />

      <LeadershipTeaser />

      <WeeklyActivities serviceTimes={serviceTimes} tone="night" />

      {/* Community — photo background, staggered heading, link list. */}
      <section className="relative isolate overflow-hidden bg-night text-white">
        <Image
          src="/images/general/general-congregation-worship-1.jpg"
          alt=""
          fill
          sizes="100vw"
          className="-z-10 object-cover opacity-45"
        />
        <div className="grid gap-12 px-4 py-24 sm:px-6 sm:py-32 lg:grid-cols-2 lg:px-9">
          <div>
            <Eyebrow>Community</Eyebrow>
            <StaggeredHeading
              className="mt-6"
              lines={["Community is", "a key part of", "life at the new breed"]}
              haloLine={0}
              haloClassName="text-brand-300"
            />
          </div>
          <div className="flex flex-col justify-center gap-8">
            <ul className="space-y-3 font-display text-3xl font-normal uppercase tracking-tight sm:text-5xl">
              {["Cell groups", "Worship team", "Service teams", "Prayer"].map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
            <div>
              <TextLink href="/first-timers">I&apos;m new — learn more</TextLink>
            </div>
          </div>
        </div>
      </section>

      <TestimoniesSection />

      {/* 50/50 split — text | photo (Discipleship block pattern). */}
      <section className="grid lg:grid-cols-2">
        <div className="bg-surface px-4 py-20 sm:px-6 sm:py-28 lg:px-9">
          <Eyebrow className="text-brand-700 dark:text-brand-300">Growth</Eyebrow>
          <StaggeredHeading
            className="mt-6 text-[#17131f] dark:text-white"
            lines={["New here?"]}
            haloLine={0}
            haloClassName="text-brand-600"
          />
          <p className="t-body mt-8 max-w-sm text-current/75">
            Whether it&apos;s your first visit or you&apos;re looking for what&apos;s happening this
            week, we&apos;ve got you covered.
          </p>
          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-4 [--link-accent:var(--color-brand-600)]">
            <TextLink href="/first-timers">I&apos;m new</TextLink>
            <TextLink href="/announcements">This week</TextLink>
          </div>
        </div>
        <div className="relative min-h-[22rem]">
          <Image
            src="/images/first-timers/first-timers-welcome-smiles.jpg"
            alt="Visitors being welcomed"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </section>

      <section className="relative isolate bg-brand-900 text-white">
        <Image
          src="/images/hero/hero-sanctuary-wide.jpg"
          alt=""
          fill
          sizes="100vw"
          className="-z-10 object-cover opacity-30"
          style={{ objectPosition: "50% 55%" }}
        />
        <div className="px-4 py-24 text-center sm:px-6 lg:px-9">
          <StaggeredHeading as="h2" size="sm" lines={["Stay", "connected"]} haloLine={1} haloClassName="text-brand-300" align="center" />
          <p className="t-body mx-auto mt-6 max-w-md text-white/85">
            Sign up for our newsletter to receive updates about upcoming events, sermons, and
            more.
          </p>
          <div className="mt-8">
            <NewsletterForm />
          </div>
        </div>
      </section>
    </>
  );
}
