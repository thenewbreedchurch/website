import Image from "next/image";
import { SectionBand } from "./section-band";
import { Eyebrow } from "./eyebrow";
import { StaggeredHeading } from "./staggered-heading";
import { cn } from "@/lib/utils";

interface PageHeroProps {
  eyebrow: string;
  /** Visual lines of the h1 (each later line steps right). */
  lines: string[];
  haloLine?: number;
  description?: React.ReactNode;
  tone?: "night" | "violet";
  /** Optional full-bleed photo behind the headline (darkened for legibility). */
  image?: string;
  imagePosition?: string;
  children?: React.ReactNode;
  className?: string;
}

/** Shared inner-page header: eyebrow + staggered h1 with halo + intro copy. */
export function PageHero({
  eyebrow,
  lines,
  haloLine = lines.length - 1,
  description,
  tone = "night",
  image,
  imagePosition = "50% 40%",
  children,
  className,
}: PageHeroProps) {
  return (
    <SectionBand
      tone={tone}
      className={cn(
        "relative isolate overflow-hidden !pb-16 !pt-16 sm:!pb-20 sm:!pt-24",
        image && "flex min-h-[60vh] flex-col justify-end sm:min-h-[70vh]",
        className
      )}
    >
      {image && (
        <>
          <Image
            src={image}
            alt=""
            fill
            priority
            sizes="100vw"
            className="-z-10 object-cover"
            style={{ objectPosition: imagePosition }}
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-night via-night/55 to-night/25" />
        </>
      )}
      <Eyebrow className={tone === "violet" ? "text-white/80" : undefined}>{eyebrow}</Eyebrow>
      <StaggeredHeading
        as="h1"
        className="mt-6"
        lines={lines}
        haloLine={haloLine}
        haloClassName={tone === "violet" ? "text-white" : "text-brand-400"}
      />
      {description && (
        <p className="t-body mt-8 max-w-xl text-base text-white/85 sm:text-lg">{description}</p>
      )}
      {children}
    </SectionBand>
  );
}
