"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { CONSENT_COOKIE_NAME } from "@/components/consent/cookie-consent-banner";

const VISITOR_COOKIE_NAME = "nbc_visitor_id";
const VISITOR_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // ~1 year, in seconds

function readCookie(name: string): string | undefined {
  return document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))?.[1];
}

// Only ever called when consent is "accepted" — generates a fresh random,
// anonymous id the first time, then reuses it on every subsequent view so
// repeat visits from the same browser de-duplicate into one "unique
// visitor" rather than inflating the count. Never sent anywhere but this
// site's own /api/track endpoint.
function getOrCreateVisitorId(): string {
  const existing = readCookie(VISITOR_COOKIE_NAME);
  if (existing) return existing;

  const id = crypto.randomUUID();
  document.cookie = `${VISITOR_COOKIE_NAME}=${id}; max-age=${VISITOR_COOKIE_MAX_AGE}; path=/; SameSite=Lax`;
  return id;
}

// Anonymous first-party pageview beacon (see PageView in schema.prisma).
// Fires on both full loads and client-side App Router navigations since
// it's keyed off usePathname() rather than a one-time mount effect. The ref
// guard stops React Strict Mode's dev-only double-invoke from
// double-counting the very first path.
export function PageViewTracker() {
  const pathname = usePathname();
  const lastTracked = useRef<string | null>(null);

  useEffect(() => {
    if (lastTracked.current === pathname) return;
    lastTracked.current = pathname;

    const consented = readCookie(CONSENT_COOKIE_NAME) === "accepted";
    const visitorId = consented ? getOrCreateVisitorId() : undefined;

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({ path: pathname, visitorId }),
    }).catch(() => {
      // Best-effort — a dropped pageview count is never worth surfacing to
      // the visitor or retrying.
    });
  }, [pathname]);

  return null;
}
