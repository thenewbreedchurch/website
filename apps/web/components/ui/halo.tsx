"use client";

import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/motion";

/** The one hand-drawn ring used site-wide (headlines and the belief carousel). */
export const SCRIBBLE_VIEWBOX = "0 0 181 39";
export const SCRIBBLE_PATH =
  "M2 24.1566C57.9235 0.788094 178.723 -4.81191 178.557 10.7896C178.391 26.3912 24.9217 45.859 20.7234 31.3881C16.5252 16.9172 133.723 5.98809 163.123 13.3881";
/** Sits under the word, slightly wider than it — never through the letters. */
export const SCRIBBLE_POSITION =
  "pointer-events-none absolute -bottom-[0.22em] left-[-4%] h-[0.5em] w-[108%]";

/**
 * Hand-drawn ring that sits under one word of a headline (wearethenew.org's
 * signature flourish). Stroke follows `currentColor`, so the wrapper's text
 * color decides the accent. Draws itself in on view.
 */
export function Halo({ className }: { className?: string }) {
  const reduced = usePrefersReducedMotion();
  return (
    <svg
      aria-hidden="true"
      viewBox={SCRIBBLE_VIEWBOX}
      preserveAspectRatio="none"
      className={`${SCRIBBLE_POSITION} ${className ?? ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
    >
      <motion.path
        d={SCRIBBLE_PATH}
        initial={reduced ? false : { pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
      />
    </svg>
  );
}
