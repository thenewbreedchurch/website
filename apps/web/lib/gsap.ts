"use client";

import { useEffect, useRef, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "./motion";

let registered = false;
function ensureRegistered() {
  if (!registered && typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    registered = true;
  }
}

/**
 * Reserved for the one or two cinematic "wow" moments called out in the plan
 * (homepage hero intro, New Converts scroll-story) — not the default motion
 * layer. Most scroll-linked/tilt animation should use framer-motion
 * (lib/motion.ts) instead; reach for this only for pinned sections or
 * scroll-scrubbed timelines framer-motion doesn't do well.
 *
 * Usage:
 *   const ref = useRef<HTMLDivElement>(null);
 *   useGsapScrollTimeline(ref, (tl, el) => {
 *     tl.from(el.querySelectorAll(".line"), { opacity: 0, y: 40, stagger: 0.15 });
 *   });
 */
export function useGsapScrollTimeline<T extends HTMLElement>(
  ref: RefObject<T | null>,
  build: (timeline: gsap.core.Timeline, el: T) => void,
  deps: unknown[] = []
) {
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion) return;

    ensureRegistered();
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top 75%",
          end: "bottom top",
          toggleActions: "play none none reverse",
        },
      });
      build(tl, el);
    }, el);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, reducedMotion, ...deps]);
}

/** Escape hatch for a manually-managed GSAP context, cleaned up on unmount. */
export function useGsapContext<T extends HTMLElement>(
  ref: RefObject<T | null>,
  setup: (el: T) => void,
  deps: unknown[] = []
) {
  const reducedMotion = usePrefersReducedMotion();
  const ctxRef = useRef<gsap.Context | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion) return;
    ensureRegistered();
    ctxRef.current = gsap.context(() => setup(el), el);
    return () => ctxRef.current?.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, reducedMotion, ...deps]);
}
