"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const ACTIVITY_EVENTS = ["mousemove", "keydown", "click", "scroll"] as const;

// UX-only proactive idle timer: navigates to /admin/session-timeout after
// `idleMinutes` of no user activity, instead of waiting for the user's next
// request to bounce off the server-side idle check in lib/session.ts. That
// server-side check (a sliding lastActiveAt window, enforced in
// getSessionFromCookie) is what actually matters for security — this
// component only makes the experience proactive. It is trivially bypassable
// by an attacker with the cookie (they'd just not run this JS), which is
// exactly why the enforcement must not live here alone.
export function InactivityWatcher({ idleMinutes }: { idleMinutes: number }) {
  const router = useRouter();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const idleMs = Math.max(1, idleMinutes) * 60 * 1000;

    function reset() {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        router.push("/admin/session-timeout");
      }, idleMs);
    }

    reset();
    for (const evt of ACTIVITY_EVENTS) {
      window.addEventListener(evt, reset, { passive: true });
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      for (const evt of ACTIVITY_EVENTS) {
        window.removeEventListener(evt, reset);
      }
    };
  }, [idleMinutes, router]);

  return null;
}
