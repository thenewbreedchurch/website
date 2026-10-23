import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@nb-church/db";
import { pageMetadata } from "@/lib/metadata";
import { SectionBand } from "@/components/ui/section-band";
import { Eyebrow } from "@/components/ui/eyebrow";
import { StaggeredHeading } from "@/components/ui/staggered-heading";
import { TextLink } from "@/components/ui/text-link";
import { NewConvertInquiryForm } from "@/components/new-converts/inquiry-form";

export function generateMetadata(): Metadata {
  return pageMetadata({
    title: "New Converts",
    description:
      "Just gave your life to Christ, or thinking about it? Here are simple next steps to help you grow at The New Breed Church.",
    path: "/new-converts",
  });
}

export default async function NewConvertsPage() {
  const steps = await prisma.nextStep.findMany({
    where: { page: "NEW_CONVERT", isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <>
      <section className="relative isolate flex min-h-[70vh] items-end overflow-hidden bg-night text-white">
        <Image
          src="/images/new-converts/new-converts-altar-prayer.jpg"
          alt="Prayer at the altar"
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover"
          style={{ objectPosition: "50% 35%" }}
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-night via-night/50 to-night/20" />
        <div className="px-4 pb-16 pt-32 sm:px-6 lg:px-9">
          <Eyebrow>New converts</Eyebrow>
          <StaggeredHeading
            as="h1"
            className="mt-6"
            lines={["Welcome to", "your new life", "in Christ"]}
            haloLine={2}
          />
          <p className="t-body mt-8 max-w-lg text-base text-white/85 sm:text-lg">
            Whatever brought you here today, we&apos;re genuinely glad you&apos;re taking this step
            — and we want to walk it with you.
          </p>
        </div>
      </section>

      <SectionBand tone="white">
        <Eyebrow className="text-brand-700 dark:text-brand-300">Next steps</Eyebrow>
        <StaggeredHeading className="mt-6" lines={["Your", "next steps"]} haloLine={1} haloClassName="text-brand-600" />
        <p className="t-body mt-6 max-w-md text-current/70">
          Faith grows best in community. Here are a few simple ways to keep moving forward.
        </p>

        {steps.length === 0 ? (
          <p className="mt-10 text-current/70">
            We&apos;re updating this page — in the meantime,{" "}
            <Link href="/contact" className="font-semibold underline">
              reach out to us directly
            </Link>
            .
          </p>
        ) : (
          <ol className="mt-14">
            {steps.map((step, i) => (
              <li
                key={step.id}
                className="grid gap-4 border-t border-current/20 py-8 last:border-b sm:grid-cols-[5rem_1fr_auto] sm:items-start sm:gap-8"
              >
                <span className="font-display text-5xl font-bold leading-none text-brand-600">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-display text-2xl font-bold uppercase leading-none tracking-tight sm:text-3xl">
                    {step.title}
                  </h3>
                  <p className="t-body mt-3 max-w-xl text-current/75">{step.body}</p>
                </div>
                {step.ctaUrl && step.ctaLabel && (
                  <TextLink
                    href={step.ctaUrl}
                    external={step.ctaUrl.startsWith("http")}
                  >
                    {step.ctaLabel}
                  </TextLink>
                )}
              </li>
            ))}
          </ol>
        )}
      </SectionBand>

      <SectionBand tone="violet">
        <div className="mx-auto max-w-2xl">
          <StaggeredHeading size="sm" lines={["Tell us", "you're here"]} haloLine={1} haloClassName="text-white" />
          <p className="t-body mt-6 text-white/85">
            Fill this out and someone from our team will personally reach out — no generic
            replies, just a real person glad to walk this with you.
          </p>
          <div className="mt-10">
            <NewConvertInquiryForm />
          </div>
        </div>
      </SectionBand>
    </>
  );
}
