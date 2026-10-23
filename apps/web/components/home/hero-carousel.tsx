"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/motion";

export interface HeroSlide {
  image: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  external?: boolean;
  /** CSS object-position for the background image; falls back to a per-image default below. */
  objectPosition?: string;
}

const AUTO_ADVANCE_MS = 6000;
const SWIPE_THRESHOLD_PX = 50;

/** Focal points for the current hero photo set, keyed by image path, since the
 * source slides don't set `objectPosition` themselves. Add an entry here (or
 * pass `objectPosition` on the slide) when a new hero image needs a specific crop. */
const DEFAULT_OBJECT_POSITIONS: Record<string, string> = {
  "/images/hero/hero-congregation-worship.jpg": "45% 30%",
  "/images/hero/hero-preaching-purple.jpg": "50% 20%",
  "/images/hero/hero-community-embrace.jpg": "50% 35%",
};

/**
 * Full-bleed auto-advancing hero carousel. Parallax depth (background image
 * drifts slower than the foreground content on scroll) uses framer-motion's
 * useScroll/useTransform per the plan's named "hero carousel parallax" spot.
 * Auto-advance and parallax are both skipped under prefers-reduced-motion,
 * but manual navigation (dots, swipe) always stays available.
 */
export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const touchStartX = useRef<number | null>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, 140]);

  const goTo = useCallback(
    (next: number) => setIndex(((next % slides.length) + slides.length) % slides.length),
    [slides.length]
  );

  useEffect(() => {
    if (reducedMotion || paused || slides.length <= 1) return;
    const id = setInterval(() => goTo(index + 1), AUTO_ADVANCE_MS);
    return () => clearInterval(id);
  }, [reducedMotion, paused, index, goTo, slides.length]);

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const deltaX = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
    if (Math.abs(deltaX) > SWIPE_THRESHOLD_PX) {
      goTo(index + (deltaX < 0 ? 1 : -1));
    }
    touchStartX.current = null;
  }

  const slide = slides[index];
  if (!slide) return null;

  return (
    <section
      ref={sectionRef}
      className="relative h-[88vh] min-h-[560px] w-full overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      aria-roledescription="carousel"
      aria-label="Church highlights"
    >
      <AnimatePresence mode="sync">
        <motion.div
          key={slide.image}
          className="absolute inset-0"
          style={reducedMotion ? undefined : { y: parallaxY }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <Image
            src={slide.image}
            alt=""
            fill
            priority={index === 0}
            sizes="100vw"
            className="object-cover"
            style={{
              objectPosition:
                slide.objectPosition ?? DEFAULT_OBJECT_POSITIONS[slide.image] ?? "center",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-night via-night/40 to-night/30" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 flex h-full flex-col justify-end px-4 pb-12 sm:px-6 lg:px-9">
        {/* Grid stacking: outgoing and incoming text share one cell, so the new
            slide's text never sits below the old one while it fades out. */}
        <div className="grid max-w-4xl self-start text-left">
          <AnimatePresence mode="sync">
            <motion.div
              key={slide.title}
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="col-start-1 row-start-1 text-white"
            >
              <h1 className="t-display">{slide.title}</h1>
              <p className="t-body mt-5 max-w-lg text-base text-white/85 sm:text-lg">
                {slide.subtitle}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-3 self-center">
          <Link
            href={slide.ctaHref}
            target={slide.external ? "_blank" : undefined}
            rel={slide.external ? "noopener noreferrer" : undefined}
            className="bg-brand-600 px-6 py-4 text-sm font-bold uppercase tracking-tight text-white transition-colors hover:bg-brand-500"
          >
            {slide.ctaLabel}
          </Link>
          <Link
            href="/about"
            className="border border-brand-300 px-6 py-4 text-sm font-bold uppercase tracking-tight text-white transition-colors hover:bg-white/10"
          >
            About us
          </Link>
        </div>

        {slides.length > 1 && (
          <div className="mt-8 flex items-center gap-2 self-center">
            {slides.map((s, i) => (
              <button
                key={s.image}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index}
                className={`h-[3px] transition-all ${
                  i === index ? "w-10 bg-white" : "w-6 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
