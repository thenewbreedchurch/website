"use client";

import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/motion";

/**
 * Hand-drawn ellipse scribble that sits over one word of a headline
 * (wearethenew.org's signature flourish). Stroke follows `currentColor`, so
 * the wrapper's text color decides the accent. Draws itself in on view.
 */
export function Halo({ className }: { className?: string }) {
  const reduced = usePrefersReducedMotion();
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 200 40"
      preserveAspectRatio="none"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
    >
      <motion.path
        d="M12 22 C 18 6, 96 2, 150 8 C 192 13, 198 28, 160 34 C 110 41, 30 38, 10 26 C 2 20, 30 10, 70 9"
        initial={reduced ? false : { pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
      />
    </svg>
  );
}
