import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, HeartHandshake } from "lucide-react";
import { prisma } from "@nb-church/db";
import { pageMetadata } from "@/lib/metadata";
import { Container } from "@/components/ui/container";
import { RevealSection } from "@/components/journey/reveal-section";
import { TiltCard } from "@/components/journey/tilt-card";
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
      <section className="relative flex min-h-[55vh] items-center overflow-hidden">
        <Image
          src="/images/new-converts/new-converts-altar-prayer.jpg"
          alt="Prayer at the altar"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/30" />
        <Container className="relative py-24 text-center text-white">
          <HeartHandshake size={32} className="mx-auto text-brand-200" />
          <h1 className="mx-auto mt-5 max-w-xl font-display text-4xl font-bold sm:text-5xl">
            Welcome to your new life in Christ
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-lg text-white/85">
            Whatever brought you here today, we&apos;re genuinely glad you&apos;re
            taking this step — and we want to walk it with you.
          </p>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <RevealSection className="mx-auto max-w-xl text-center">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              Your Next Steps
            </h2>
            <p className="mt-3 text-current/70">
              Faith grows best in community. Here are a few simple ways to keep moving
              forward.
            </p>
          </RevealSection>

          {steps.length === 0 ? (
            <p className="mt-10 text-center text-current/70">
              We&apos;re updating this page — in the meantime,{" "}
              <Link href="/contact" className="font-medium text-brand-700 hover:underline dark:text-brand-300">
                reach out to us directly
              </Link>
              .
            </p>
          ) : (
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {steps.map((step, i) => (
                <TiltCard
                  key={step.id}
                  className="flex flex-col rounded-3xl border border-border bg-surface p-7"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-700 text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <h3 className="mt-4 font-display text-xl font-bold">{step.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-current/75">
                    {step.body}
                  </p>
                  {step.ctaUrl && step.ctaLabel && (
                    <Link
                      href={step.ctaUrl}
                      target={step.ctaUrl.startsWith("http") ? "_blank" : undefined}
                      rel={step.ctaUrl.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline dark:text-brand-300"
                    >
                      {step.ctaLabel} <ArrowRight size={14} />
                    </Link>
                  )}
                </TiltCard>
              ))}
            </div>
          )}
        </Container>
      </section>

      <section className="bg-surface-muted py-16">
        <Container className="max-w-2xl">
          <RevealSection className="text-center">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              Tell Us You&apos;re Here
            </h2>
            <p className="mt-3 text-current/70">
              Fill this out and someone from our team will personally reach out — no
              generic replies, just a real person glad to walk this with you.
            </p>
          </RevealSection>
          <RevealSection className="mt-10">
            <NewConvertInquiryForm />
          </RevealSection>
        </Container>
      </section>
    </>
  );
}
