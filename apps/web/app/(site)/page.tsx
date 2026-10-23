import Image from "next/image";
import { Suspense } from "react";
import type { Metadata } from "next";
import { getChurchSettings, getServiceTimes } from "@/lib/settings";
import { pageMetadata } from "@/lib/metadata";
import { SectionBand } from "@/components/ui/section-band";
import { Eyebrow } from "@/components/ui/eyebrow";
import { StaggeredHeading } from "@/components/ui/staggered-heading";
import { TextLink } from "@/components/ui/text-link";
import { HeroCarousel, type HeroSlide } from "@/components/home/hero-carousel";
import { WeeklyActivities } from "@/components/home/weekly-activities";
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

// Simple shape-matching skeletons so each section's own Suspense boundary
// doesn't cause a jarring blank-to-content jump while its (independent)
// query resolves — see the Suspense wrappers below.
function TestimoniesSkeleton() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
        <div className="mx-auto h-9 w-48 animate-pulse rounded bg-surface-muted" />
        <div className="mx-auto mt-3 h-5 w-72 animate-pulse rounded bg-surface-muted" />
        <div className="mt-10 grid gap-6 text-left sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-40 animate-pulse border border-border bg-surface-muted" />
          ))}
        </div>
      </div>
    </section>
  );
}

function LeadershipSkeleton() {
  return (
    <section className="bg-surface px-4 py-20 sm:px-6 lg:px-9">
      <div className="h-20 w-64 animate-pulse bg-surface-muted" />
      <div className="mt-14 grid grid-cols-2 gap-6 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="aspect-[4/5] animate-pulse bg-surface-muted" />
        ))}
      </div>
    </section>
  );
}

function SermonsTeaserSkeleton() {
  return (
    <section className="bg-surface-muted py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="h-9 w-56 animate-pulse rounded bg-surface" />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="aspect-[4/5] animate-pulse bg-surface" />
          ))}
        </div>
      </div>
    </section>
  );
}

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

  const slides: HeroSlide[] = [
    {
      image: "/images/hero/hero-congregation-worship.jpg",
      title: `Welcome to ${settings.orgName}`,
      subtitle: settings.tagline,
      ctaLabel: "Join Us Sunday",
      ctaHref: settings.livestreamUrl ?? "/first-timers",
      external: Boolean(settings.livestreamUrl),
    },
    {
      image: "/images/hero/hero-preaching-purple.jpg",
      title: "Experience God's Love",
      subtitle: "Join our community of believers in worship and fellowship",
      ctaLabel: "Register as a Member",
      ctaHref: settings.memberRegistrationUrl ?? "/first-timers",
      external: Boolean(settings.memberRegistrationUrl),
    },
    {
      image: "/images/hero/hero-community-embrace.jpg",
      title: "Grow in Community",
      subtitle: "Connect with others on your spiritual journey",
      ctaLabel: "Get Connected",
      ctaHref: settings.instagramUrl ?? "/first-timers",
      external: Boolean(settings.instagramUrl),
    },
  ];

  return (
    <>
      <HeroCarousel slides={slides} />

      {/* Belief band — mission left, big statement center, tagline right. */}
      <SectionBand tone="violet" className="!py-16 sm:!py-24">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_2fr_1fr]">
          {settings.missionStatement && (
            <p className="t-body max-w-xs text-base text-white/90">{settings.missionStatement}</p>
          )}
          <StaggeredHeading
            as="h2"
            lines={["We are", "a new breed"]}
            haloLine={1}
            haloClassName="text-white"
            align="center"
            className="lg:text-center"
          />
          <p className="t-body max-w-xs text-base text-white/90 lg:ml-auto lg:text-right">
            {settings.tagline}
          </p>
        </div>
      </SectionBand>

      {/* Edge-to-edge photo strip, no gutters or gaps. */}
      <section aria-hidden="true" className="grid h-64 grid-cols-2 sm:h-96 lg:h-[30rem] lg:grid-cols-[1fr_1fr_1.6fr_1.2fr]">
        {STRIP_IMAGES.map((src, i) => (
          <div key={src} className={`relative ${i > 1 ? "hidden lg:block" : ""}`}>
            <Image src={src} alt="" fill sizes="(min-width: 1024px) 30vw, 50vw" className="object-cover" />
          </div>
        ))}
      </section>

      <Suspense fallback={<SermonsTeaserSkeleton />}>
        <SermonsTeaser />
      </Suspense>

      <Suspense fallback={null}>
        <UpcomingEvents />
      </Suspense>

      <Suspense fallback={<LeadershipSkeleton />}>
        <LeadershipTeaser />
      </Suspense>

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

      <Suspense fallback={<TestimoniesSkeleton />}>
        <TestimoniesSection testimonyEmail={settings.email} />
      </Suspense>

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
