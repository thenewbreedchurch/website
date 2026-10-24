"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Set by ServiceTimesLink when it has to change page first; consumed on the home page. */
export const PENDING_SCROLL_KEY = "nbc-scroll-to";

function navigationType(): string {
  const entry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
  return entry?.type ?? "navigate";
}

function stripHash() {
  if (window.location.hash) {
    window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search);
  }
}

/**
 * Scroll rules for the public site:
 *  - A refresh always starts at the top. Browsers otherwise restore the old
 *    scroll position, or jump to a leftover `#section` in the address, and
 *    iPhone/iPad browsers then land in the wrong place while the page is still
 *    settling (images and late content change the height above you).
 *  - A direct visit to `/#section` (e.g. a shared link) lands on that section,
 *    re-aligned once the page has settled, then the `#section` is dropped from
 *    the address so a later refresh goes to the top.
 *  - ServiceTimesLink scrolls to a section without ever touching the address;
 *    when it has to change page first it leaves a one-shot note for us.
 */
export function HashScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const timers: number[] = [];
    let cancelled = false;
    const cancel = () => {
      cancelled = true;
      timers.forEach((t) => window.clearTimeout(t));
    };
    // A manual scroll means the visitor has taken over; stop fighting them.
    window.addEventListener("wheel", cancel, { once: true, passive: true });
    window.addEventListener("touchstart", cancel, { once: true, passive: true });

    const later = (fn: () => void, ms: number) => {
      timers.push(
        window.setTimeout(() => {
          if (!cancelled) fn();
        }, ms)
      );
    };
    const align = (id: string, behavior: ScrollBehavior) =>
      document.getElementById(id)?.scrollIntoView({ behavior, block: "start" });

    const hashId = decodeURIComponent(window.location.hash.slice(1));
    const pending = window.sessionStorage.getItem(PENDING_SCROLL_KEY);
    const firstLoad = !document.documentElement.dataset.hashScrollDone;
    document.documentElement.dataset.hashScrollDone = "1";

    if (firstLoad && navigationType() === "reload") {
      // Refresh → top of the page.
      window.history.scrollRestoration = "manual";
      stripHash();
      window.scrollTo({ top: 0, behavior: "instant" });
      later(() => window.scrollTo({ top: 0, behavior: "instant" }), 400);
      window.addEventListener(
        "load",
        () => {
          if (!cancelled) window.scrollTo({ top: 0, behavior: "instant" });
          window.history.scrollRestoration = "auto";
        },
        { once: true }
      );
      later(() => (window.history.scrollRestoration = "auto"), 1500);
    } else if (pending) {
      // Arrived here from another page via ServiceTimesLink.
      window.sessionStorage.removeItem(PENDING_SCROLL_KEY);
      later(() => align(pending, "smooth"), 250);
    } else if (hashId) {
      // Direct visit (or in-site link) to /#section.
      align(hashId, "instant");
      later(() => align(hashId, "instant"), 600);
      window.addEventListener("load", () => !cancelled && align(hashId, "instant"), { once: true });
      later(stripHash, 1800);
    }

    return () => {
      cancel();
      window.removeEventListener("wheel", cancel);
      window.removeEventListener("touchstart", cancel);
    };
  }, [pathname]);

  return null;
}
