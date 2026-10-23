import { cn } from "@/lib/utils";

type Tone = "violet" | "night" | "white";

const TONES: Record<Tone, string> = {
  // Their yellow band → our brand violet.
  violet: "bg-brand-700 text-white [--link-accent:var(--color-brand-200)]",
  night: "bg-night text-white [--link-accent:var(--color-brand-400)]",
  white:
    "bg-surface text-[#17131f] dark:text-white [--link-accent:var(--color-brand-700)] dark:[--link-accent:var(--color-brand-400)]",
};

interface SectionBandProps extends React.HTMLAttributes<HTMLElement> {
  tone?: Tone;
  /** Edge-to-edge content (photo strips) — no horizontal gutter. */
  flush?: boolean;
}

/** Full-bleed flat color band with the site's wide gutter and big rhythm. */
export function SectionBand({ tone = "night", flush, className, ...props }: SectionBandProps) {
  return (
    <section
      className={cn(
        TONES[tone],
        flush ? "" : "px-4 py-20 sm:px-6 sm:py-28 lg:px-9",
        className
      )}
      {...props}
    />
  );
}
