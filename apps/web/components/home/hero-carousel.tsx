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
      className="relative h-[85vh] min-h-[520px] w-full overflow-hidden"
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/40" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 flex h-full items-center">
        <div className="mx-auto grid w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <AnimatePresence mode="sync">
            <motion.div
              key={slide.title}
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="col-start-1 row-start-1 max-w-xl text-white"
            >
              <h1 className="font-display text-4xl font-bold sm:text-5xl lg:text-6xl">
                {slide.title}
              </h1>
              <p className="mt-4 text-lg text-white/90 sm:text-xl">{slide.subtitle}</p>
              <Link
                href={slide.ctaHref}
                target={slide.external ? "_blank" : undefined}
                rel={slide.external ? "noopener noreferrer" : undefined}
                className="mt-8 flex h-12 w-full items-center justify-center rounded-full bg-brand-600 px-8 text-base font-medium text-white transition-[background-color,transform] hover:bg-brand-700 active:scale-[0.98] sm:inline-flex sm:w-auto"
              >
                {slide.ctaLabel}
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {slides.length > 1 && (
        <div className="absolute inset-x-0 bottom-6 z-10 flex justify-center gap-2">
          {slides.map((s, i) => (
            <button
              key={s.image}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === index}
              className={`h-2.5 rounded-full transition-all ${
                i === index ? "w-8 bg-white" : "w-2.5 bg-white/50 hover:bg-white/75"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
