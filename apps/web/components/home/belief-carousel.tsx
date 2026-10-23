"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/lib/motion";

export interface BeliefSlide {
  before?: string;
  mark: string;
  after?: string;
  /** Longer statements are set a little smaller so they stay inside the column. */
  long?: boolean;
}

const INTERVAL_MS = 2800;

// Hand-drawn scribble under the highlighted word; redraws every time its slide becomes active.
function Scribble({ active }: { active: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 181 39"
      fill="none"
      preserveAspectRatio="none"
      className="pointer-events-none absolute -bottom-[0.22em] left-[-4%] h-[0.5em] w-[108%] text-white"
    >
      <path
        d="M2 24.1566C57.9235 0.788094 178.723 -4.81191 178.557 10.7896C178.391 26.3912 24.9217 45.859 20.7234 31.3881C16.5252 16.9172 133.723 5.98809 163.123 13.3881"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        pathLength={1}
        style={{
          strokeDasharray: 1,
          strokeDashoffset: active ? 0 : 1,
          transition: active ? "stroke-dashoffset 1.1s cubic-bezier(0.22,1,0.36,1) 0.35s" : "none",
        }}
      />
    </svg>
  );
}

/**
 * wearethenew.org's "Our belief" block: one statement big and centred, the
 * previous and next ones small above/below, rotating on a timer (only while
 * the section is on screen). Mission sits left, tagline right; they stack
 * under the statements on phones.
 */
export function BeliefCarousel({
  eyebrow = "Our belief",
  slides,
  left,
  right,
}: {
  eyebrow?: string;
  slides: BeliefSlide[];
  left?: string;
  right?: string;
}) {
  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(false);
  const reduced = usePrefersReducedMotion();
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        // Always open on the first statement ("We are a new breed") when the section comes into view.
        if (entry.isIntersecting) setActive(0);
        setInView(entry.isIntersecting);
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || reduced || slides.length < 2) return;
    const id = window.setInterval(() => setActive((i) => (i + 1) % slides.length), INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [inView, reduced, slides.length]);

  const n = slides.length;
  // Shortest signed distance on the ring: 0 = current, -1 = previous, 1 = next.
  const offsetOf = (i: number) => {
    let d = (i - active + n) % n;
    if (d > n / 2) d -= n;
    return d;
  };

  return (
    <section
      ref={rootRef}
      aria-label={eyebrow}
      className="bg-brand-700 px-4 py-20 text-white sm:px-6 sm:py-24 lg:px-9 lg:py-28 [--link-accent:var(--color-brand-200)]"
    >
      <div className="mx-auto flex max-w-[90rem] flex-col items-center">
        <p className="t-eyebrow">{eyebrow}</p>

        <div className="mt-10 grid w-full items-center gap-10 lg:mt-16 lg:grid-cols-[1fr_minmax(0,2.6fr)_1fr] lg:gap-8">
          {left && <p className="t-body order-2 max-w-xs text-lg text-white/90 lg:order-none">{left}</p>}

          <div
            aria-hidden="true"
            className="relative order-1 mx-auto h-[19rem] w-full max-w-3xl overflow-hidden sm:h-[22rem] lg:order-none"
            style={{ "--off": "clamp(5.25rem, 17vw, 8.5rem)" } as React.CSSProperties}
          >
            {slides.map((s, i) => {
              const d = offsetOf(i);
              const isActive = d === 0;
              const isNeighbour = Math.abs(d) === 1;
              return (
                <div
                  key={`${s.before ?? ""}${s.mark}${s.after ?? ""}`}
                  className="absolute inset-0 flex items-center justify-center px-2"
                  style={{
                    opacity: isActive || isNeighbour ? 1 : 0,
                    transform: isActive
                      ? "translateY(0) scale(1)"
                      : isNeighbour
                        ? `translateY(calc(var(--off) * ${d})) scale(0.32)`
                        : "translateY(0) scale(0.3)",
                    color: isActive ? "#fff" : "rgba(255,255,255,0.5)",
                    transition:
                      "transform 0.7s cubic-bezier(0.22,1,0.36,1), opacity 0.35s, color 0.5s",
                  }}
                >
                  <p
                    className={cn(
                      "font-display text-center font-bold uppercase leading-[1] tracking-[-0.03em] text-balance",
                      s.long ? "text-[clamp(1.85rem,8.4vw,3.8rem)]" : "text-[clamp(2.4rem,11vw,5rem)]"
                    )}
                  >
                    {s.before}
                    <span className="relative inline-block">
                      {s.mark}
                      <Scribble active={isActive} />
                    </span>
                    {s.after}
                  </p>
                </div>
              );
            })}
          </div>

          {right && (
            <p className="t-body order-3 max-w-xs text-lg text-white/90 lg:order-none lg:ml-auto lg:text-right">
              {right}
            </p>
          )}
        </div>

        {/* The rotating text is hidden from assistive tech; this is the readable version. */}
        <ul className="sr-only">
          {slides.map((s) => (
            <li key={`sr-${s.mark}`}>{`${s.before ?? ""}${s.mark}${s.after ?? ""}`.trim()}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
