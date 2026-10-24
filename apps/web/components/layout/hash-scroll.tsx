"use client";

import { useEffect } from "react";

/**
 * Keeps a `#section` link landing on its section after a refresh or a direct
 * visit. The browser jumps to the anchor as soon as it exists, but images and
 * late-arriving content above it can still change the page height afterwards —
 * and iPhone/iPad browsers don't compensate for that — so the target is
 * re-aligned (instantly, ignoring smooth scrolling) once the page has settled.
 */
export function HashScroll() {
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return;

    const align = () => {
      document.getElementById(id)?.scrollIntoView({ behavior: "instant", block: "start" });
    };

    align();
    const timer = window.setTimeout(align, 600);
    window.addEventListener("load", align, { once: true });
    // A manual scroll means the visitor has taken over; stop fighting them.
    const stop = () => {
      window.clearTimeout(timer);
      window.removeEventListener("load", align);
    };
    window.addEventListener("wheel", stop, { once: true, passive: true });
    window.addEventListener("touchstart", stop, { once: true, passive: true });
    return () => {
      stop();
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchstart", stop);
    };
  }, []);

  return null;
}
