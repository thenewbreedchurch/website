"use client";

import { useEffect, useState } from "react";
import type { Variants } from "framer-motion";

/**
 * Single source of truth for "should things move." Both the framer-motion
 * variants below and any GSAP timeline built with useGsapReady() must check
 * this — motion is a deliberate, scoped enhancement (hero, first-timers,
 * new-converts per the design plan), never a requirement for content to be
 * usable.
 */
function getInitialReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(getInitialReducedMotion);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const listener = (e: MediaQueryListEvent) => setReduced(e.matches);
    query.addEventListener("change", listener);
    return () => query.removeEventListener("change", listener);
  }, []);

  return reduced;
}

/** Standard fade-up entrance, the default for scroll-revealed content. */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 36 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

/** Staggers children using fadeInUp — apply to a motion.div wrapping cards. */
export const staggerChildren: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
};

/** Subtle 3D tilt-on-view for cards (New Converts next-step cards etc). */
export const tiltIn: Variants = {
  hidden: { opacity: 0, rotateX: 8, rotateY: -6, y: 30 },
  visible: {
    opacity: 1,
    rotateX: 0,
    rotateY: 0,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

/** Variants to hand a motion component when reduced motion is preferred — no movement, just an opacity crossfade. */
export const reducedMotionVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
};

/**
 * Returns the variants to actually use, collapsing to a plain fade when the
 * user prefers reduced motion. Call inside a client component:
 *   const variants = useMotionVariants(fadeInUp);
 */
export function useMotionVariants(variants: Variants): Variants {
  const reduced = usePrefersReducedMotion();
  return reduced ? reducedMotionVariants : variants;
}
