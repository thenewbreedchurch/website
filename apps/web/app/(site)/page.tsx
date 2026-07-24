import Image from "next/image";
import { Suspense } from "react";
import type { Metadata } from "next";
import { ArrowRight, Compass } from "lucide-react";
import { getChurchSettings, getServiceTimes } from "@/lib/settings";
import { pageMetadata } from "@/lib/metadata";
import { Container } from "@/components/ui/container";
import { LinkButton } from "@/components/ui/link-button";
import { HeroCarousel, type HeroSlide } from "@/components/home/hero-carousel";
import { WeeklyActivities } from "@/components/home/weekly-activities";
import { TestimoniesSection } from "@/components/home/testimonies-section";
import { SermonsTeaser } from "@/components/home/sermons-teaser";
import { NewsletterForm } from "@/components/home/newsletter-form";

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
            <div key={i} className="h-40 animate-pulse rounded-2xl border border-border bg-surface-muted" />
          ))}
        </div>
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
            <div key={i} className="aspect-[4/5] animate-pulse rounded-2xl bg-surface" />
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

      {settings.missionStatement && (
        <section className="py-20">
          <Container className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <h2 className="font-display text-3xl font-bold sm:text-4xl">
                Welcome to Our Community
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-current/80">
                {settings.missionStatement}
              </p>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
              <Image
                src="/images/general/general-congregation-seated.jpg"
                alt="Congregation gathered in worship"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </Container>
        </section>
      )}

      <WeeklyActivities serviceTimes={serviceTimes} />

      <section className="py-16">
        <Container className="flex flex-col items-center gap-6 rounded-3xl bg-brand-700 px-6 py-14 text-center text-white sm:px-12">
          <Compass size={32} className="text-white/90" />
          <h2 className="font-display text-2xl font-bold sm:text-3xl">
            New here, or want to know what&apos;s coming up?
          </h2>
          <p className="max-w-xl text-white/85">
            Whether it&apos;s your first visit or you&apos;re looking for what&apos;s happening
            this week, we&apos;ve got you covered.
          </p>
          <div className="flex w-full flex-wrap justify-center gap-3 sm:w-auto">
            <LinkButton href="/first-timers" variant="secondary" size="lg" className="w-full sm:w-auto">
              I&apos;m New <ArrowRight size={16} />
            </LinkButton>
            <LinkButton
              href="/announcements"
              variant="outline"
              size="lg"
              className="w-full border-white/40 text-white hover:bg-white/10 sm:w-auto"
            >
              This Week <ArrowRight size={16} />
            </LinkButton>
          </div>
        </Container>
      </section>

      <Suspense fallback={<TestimoniesSkeleton />}>
        <TestimoniesSection testimonyEmail={settings.email} />
      </Suspense>

      <Suspense fallback={<SermonsTeaserSkeleton />}>
        <SermonsTeaser />
      </Suspense>

      <section className="relative flex min-h-[45vh] items-center overflow-hidden">
        <Image
          src="/images/hero/hero-sanctuary-wide.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: "50% 55%" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-900/75 via-brand-900/35 to-brand-900/10" />
        <Container className="relative py-20 text-center text-white">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">Stay Connected</h2>
          <p className="mx-auto mt-3 max-w-lg text-white/85">
            Sign up for our newsletter to receive updates about upcoming events, sermons, and
            more.
          </p>
          <div className="mt-8">
            <NewsletterForm />
          </div>
        </Container>
      </section>
    </>
  );
}
