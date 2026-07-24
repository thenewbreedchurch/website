import type { Metadata } from "next";
import Image from "next/image";
import { Clock, MapPin, Sparkles, BookOpen, ArrowRight } from "lucide-react";
import { getChurchSettings, getServiceTimes } from "@/lib/settings";
import { pageMetadata } from "@/lib/metadata";
import { groupConsecutiveServiceTimes } from "@/lib/service-times";
import { Container } from "@/components/ui/container";
import { LinkButton } from "@/components/ui/link-button";
import { RevealSection } from "@/components/journey/reveal-section";
import { TiltCard } from "@/components/journey/tilt-card";

export function generateMetadata(): Metadata {
  return pageMetadata({
    title: "I'm New",
    description:
      "Planning your first visit to The New Breed Church? Here's when we meet, where to find us, and what to expect.",
    path: "/first-timers",
  });
}

export default async function FirstTimersPage() {
  const [settings, serviceTimes] = await Promise.all([
    getChurchSettings(),
    getServiceTimes(),
  ]);

  const sundayTimes = groupConsecutiveServiceTimes(
    serviceTimes.filter((s) => s.dayOfWeek === "SUN")
  );

  const mapHref =
    settings.mapEmbedUrl ??
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${settings.streetAddress}, ${settings.addressLocality}, ${settings.addressRegion}, ${settings.addressCountry}`
    )}`;

  return (
    <>
      <section className="relative flex min-h-[70vh] items-center overflow-hidden">
        <Image
          src="/images/first-timers/first-timers-welcome-smiles.jpg"
          alt="Members of The New Breed Church welcoming a guest"
          fill
          priority
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: "55% 20%" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/45 to-transparent" />
        <Container className="relative py-24 text-white">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium backdrop-blur">
            <Sparkles size={14} /> We&apos;re glad you&apos;re here
          </p>
          <h1 className="mt-5 max-w-xl font-display text-4xl font-bold sm:text-5xl">
            Planning your first visit?
          </h1>
          <p className="mt-4 max-w-lg text-lg text-white/85">
            Here&apos;s everything you need to know before you come — no guesswork, just
            a warm welcome.
          </p>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container className="grid gap-6 sm:grid-cols-2">
          <TiltCard className="rounded-3xl border border-border bg-surface p-8 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-lg">
            <Clock size={26} className="text-brand-700 dark:text-brand-300" />
            <h2 className="mt-4 font-display text-2xl font-bold">When We Meet</h2>
            <ul className="mt-3 space-y-1.5 text-current/80">
              {sundayTimes.map((t) => (
                <li key={t.key}>
                  <span className="font-medium">{t.time}</span> — {t.label}
                </li>
              ))}
            </ul>
          </TiltCard>

          <TiltCard className="rounded-3xl border border-border bg-surface p-8 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-lg">
            <MapPin size={26} className="text-brand-700 dark:text-brand-300" />
            <h2 className="mt-4 font-display text-2xl font-bold">Where We Are</h2>
            <p className="mt-3 text-current/80">
              {settings.streetAddress}, {settings.addressLocality},{" "}
              {settings.addressRegion}, {settings.addressCountry}
            </p>
            <a
              href={mapHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline dark:text-brand-300"
            >
              Get directions <ArrowRight size={14} />
            </a>
          </TiltCard>
        </Container>
      </section>

      <section className="bg-surface-muted py-16 sm:py-20">
        <Container className="grid items-center gap-10 lg:grid-cols-2">
          <RevealSection className="relative aspect-[4/3] overflow-hidden rounded-3xl">
            <Image
              src="/images/first-timers/first-timers-joyful-celebration.jpg"
              alt="Congregation celebrating together"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </RevealSection>
          <RevealSection>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              What to Expect
            </h2>
            <p className="mt-4 leading-relaxed text-current/80">
              Come as you are — there&apos;s no dress code. You&apos;ll be greeted by a
              friendly face at the door, and you&apos;re welcome to sit anywhere that
              feels comfortable. Expect lively worship, practical teaching from the
              Bible, and a genuinely warm community. Service usually runs from{" "}
              {sundayTimes[sundayTimes.length - 1]?.time ?? "9:00 AM"}.
            </p>
          </RevealSection>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container className="grid items-center gap-10 lg:grid-cols-2">
          <RevealSection className="order-2 lg:order-1">
            <BookOpen size={26} className="text-brand-700 dark:text-brand-300" />
            <h2 className="mt-4 font-display text-3xl font-bold sm:text-4xl">
              What We Believe
            </h2>
            <p className="mt-4 leading-relaxed text-current/80">
              {settings.missionStatement}
            </p>
            <p className="mt-3 leading-relaxed text-current/80">
              We&apos;re a parish of the Redeemed Christian Church of God (RCCG),
              rooted in the Word of God and committed to helping every person grow in
              their relationship with Jesus Christ.
            </p>
            <LinkButton href="/about" variant="outline" className="mt-6">
              Read our full story
            </LinkButton>
          </RevealSection>
          <RevealSection className="relative order-1 aspect-[4/3] overflow-hidden rounded-3xl lg:order-2">
            <Image
              src="/images/first-timers/first-timers-warm-embrace.jpg"
              alt="Warm welcome at The New Breed Church"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </RevealSection>
        </Container>
      </section>

      <section className="bg-brand-900 py-16 text-white sm:py-20">
        <Container className="flex flex-col items-center gap-6 text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            We can&apos;t wait to meet you
          </h2>
          <div className="flex w-full flex-wrap justify-center gap-3 sm:w-auto">
            {settings.memberRegistrationUrl && (
              <LinkButton
                href={settings.memberRegistrationUrl}
                target="_blank"
                rel="noopener noreferrer"
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto"
              >
                Register as a First Timer
              </LinkButton>
            )}
            <LinkButton
              href="/contact"
              variant="outline"
              size="lg"
              className="w-full border-white/40 text-white hover:bg-white/10 sm:w-auto"
            >
              Message us before you come
            </LinkButton>
          </div>
        </Container>
      </section>
    </>
  );
}
