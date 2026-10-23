import type { Metadata } from "next";
import Image from "next/image";
import { getChurchSettings, getServiceTimes } from "@/lib/settings";
import { pageMetadata } from "@/lib/metadata";
import { groupConsecutiveServiceTimes } from "@/lib/service-times";
import { SectionBand } from "@/components/ui/section-band";
import { Eyebrow } from "@/components/ui/eyebrow";
import { StaggeredHeading } from "@/components/ui/staggered-heading";
import { TextLink } from "@/components/ui/text-link";
import { LinkButton } from "@/components/ui/link-button";
import { RevealSection } from "@/components/journey/reveal-section";

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
      <section className="relative isolate flex min-h-[75vh] items-end overflow-hidden bg-night text-white">
        <Image
          src="/images/first-timers/first-timers-welcome-smiles.jpg"
          alt="Members of The New Breed Church welcoming a guest"
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover"
          style={{ objectPosition: "55% 20%" }}
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-night via-night/50 to-night/10" />
        <div className="px-4 pb-16 pt-32 sm:px-6 lg:px-9">
          <Eyebrow>We&apos;re glad you&apos;re here</Eyebrow>
          <StaggeredHeading
            as="h1"
            className="mt-6"
            lines={["Planning", "your first visit?"]}
            haloLine={1}
          />
          <p className="t-body mt-8 max-w-lg text-base text-white/85 sm:text-lg">
            Here&apos;s everything you need to know before you come — no guesswork, just a warm
            welcome.
          </p>
        </div>
      </section>

      <SectionBand tone="violet">
        <div className="grid gap-14 lg:grid-cols-2">
          <div>
            <Eyebrow className="text-white/80">When we meet</Eyebrow>
            <ul className="mt-6">
              {sundayTimes.map((t) => (
                <li key={t.key} className="border-t border-white/25 py-5 last:border-b">
                  <p className="font-display text-3xl font-bold uppercase leading-none tracking-tight">
                    {t.label}
                  </p>
                  <p className="t-eyebrow mt-2 text-white/80">Sunday · {t.time}</p>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <Eyebrow className="text-white/80">Where we are</Eyebrow>
            <p className="font-display mt-6 text-3xl font-bold uppercase leading-none tracking-tight sm:text-4xl">
              {settings.streetAddress}, {settings.addressLocality}, {settings.addressRegion},{" "}
              {settings.addressCountry}
            </p>
            <div className="mt-8 [--link-accent:var(--color-white)]">
              <TextLink href={mapHref} external>
                Get directions
              </TextLink>
            </div>
          </div>
        </div>
      </SectionBand>

      <section className="grid lg:grid-cols-2">
        <RevealSection className="relative min-h-[22rem]">
          <Image
            src="/images/first-timers/first-timers-joyful-celebration.jpg"
            alt="Congregation celebrating together"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </RevealSection>
        <SectionBand tone="white">
          <Eyebrow className="text-brand-700 dark:text-brand-300">Expect</Eyebrow>
          <StaggeredHeading className="mt-6" lines={["What to", "expect"]} haloLine={1} haloClassName="text-brand-600" />
          <p className="t-body mt-8 max-w-md text-current/80">
            Come as you are — there&apos;s no dress code. You&apos;ll be greeted by a friendly face
            at the door, and you&apos;re welcome to sit anywhere that feels comfortable. Expect
            lively worship, practical teaching from the Bible, and a genuinely warm community.
            Service usually runs from {sundayTimes[sundayTimes.length - 1]?.time ?? "9:00 AM"}.
          </p>
        </SectionBand>
      </section>

      <section className="grid lg:grid-cols-2">
        <SectionBand tone="night" className="order-2 lg:order-1">
          <Eyebrow>Belief</Eyebrow>
          <StaggeredHeading className="mt-6" lines={["What we", "believe"]} haloLine={1} />
          <p className="t-body mt-8 max-w-md text-white/80">{settings.missionStatement}</p>
          <p className="t-body mt-4 max-w-md text-white/80">
            We&apos;re a parish of the Redeemed Christian Church of God (RCCG), rooted in the Word
            of God and committed to helping every person grow in their relationship with Jesus
            Christ.
          </p>
          <div className="mt-8">
            <TextLink href="/about">Read our full story</TextLink>
          </div>
        </SectionBand>
        <RevealSection className="relative order-1 min-h-[22rem] lg:order-2">
          <Image
            src="/images/first-timers/first-timers-warm-embrace.jpg"
            alt="Warm welcome at The New Breed Church"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </RevealSection>
      </section>

      <SectionBand tone="violet" className="text-center">
        <StaggeredHeading size="sm" align="center" lines={["We can't wait", "to meet you"]} haloLine={1} haloClassName="text-white" />
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {settings.memberRegistrationUrl && (
            <LinkButton
              href={settings.memberRegistrationUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="secondary"
              size="lg"
              shape="square"
              className="bg-white text-brand-800 hover:bg-white/90 dark:bg-white dark:text-brand-800"
            >
              Register as a first timer
            </LinkButton>
          )}
          <LinkButton
            href="/contact"
            variant="outline"
            size="lg"
            shape="square"
            className="border-white/60 text-white hover:bg-white/10"
          >
            Message us before you come
          </LinkButton>
        </div>
      </SectionBand>
    </>
  );
}
