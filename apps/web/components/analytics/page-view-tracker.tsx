"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// Anonymous first-party pageview beacon — no cookie, no visitor id, just
// "this path was viewed just now" (see PageView in schema.prisma). Fires on
// both full loads and client-side App Router navigations since it's keyed
// off usePathname() rather than a one-time mount effect. The ref guard
// stops React Strict Mode's dev-only double-invoke from double-counting the
// very first path.
export function PageViewTracker() {
  const pathname = usePathname();
  const lastTracked = useRef<string | null>(null);

  useEffect(() => {
    if (lastTracked.current === pathname) return;
    lastTracked.current = pathname;

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({ path: pathname }),
    }).catch(() => {
      // Best-effort — a dropped pageview count is never worth surfacing to
      // the visitor or retrying.
    });
  }, [pathname]);

  return null;
}
