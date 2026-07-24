"use client";

import { useState, useSyncExternalStore } from "react";

const CONSENT_COOKIE_NAME = "nbc_cookie_consent";
const CONSENT_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // ~1 year, in seconds

type ConsentChoice = "accepted" | "declined";
// "pending" is a placeholder used only for the server-rendered/hydration
// pass, before we're allowed to read document.cookie — it's never a real
// stored value, just tells the component to render nothing until then.
type ConsentSnapshot = ConsentChoice | "unset" | "pending";

function readConsentCookie(): ConsentSnapshot {
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${CONSENT_COOKIE_NAME}=([^;]*)`)
  );
  const value = match?.[1];
  return value === "accepted" || value === "declined" ? value : "unset";
}

function writeConsentCookie(choice: ConsentChoice) {
  document.cookie = `${CONSENT_COOKIE_NAME}=${choice}; max-age=${CONSENT_COOKIE_MAX_AGE}; path=/; SameSite=Lax`;
}

// The cookie only ever changes via this component's own buttons, so there's
// no external event to subscribe to — this store exists purely so
// useSyncExternalStore can read document.cookie safely: it renders the
// server snapshot ("pending", i.e. hidden) through hydration, then swaps to
// the real client value in one React-scheduled update, with no manual
// setState-in-effect and no hydration mismatch.
function subscribe() {
  return () => {};
}

function getServerSnapshot(): ConsentSnapshot {
  return "pending";
}

// First-party replacement for the legacy site's consentmanager.net script.
// The site only sets one cookie today (the admin session) and loads no
// analytics/tracking, but the choice is recorded now via a first-party
// cookie (never localStorage, per house rule) so it's ready the moment
// analytics is added later. Mounted once in the root layout so it covers
// every route, including /admin and /linktree.
export function CookieConsentBanner() {
  const consent = useSyncExternalStore(subscribe, readConsentCookie, getServerSnapshot);
  const [dismissed, setDismissed] = useState(false);

  function choose(choice: ConsentChoice) {
    writeConsentCookie(choice);
    setDismissed(true);
  }

  // Once a real choice is on record, this stays hidden on every subsequent
  // render/navigation — the root layout (and this component) never
  // remounts on client-side navigation, so there's no re-check, no flash.
  if (consent !== "unset" || dismissed) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/90"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p className="text-sm text-current/80">
          We use only essential cookies to run this site, like keeping admins signed
          in. If we ever add optional analytics cookies, we&apos;ll only use them with
          your consent.
        </p>
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={() => choose("declined")}
            className="rounded-full border border-border px-4 py-2 text-sm font-medium text-current/80 transition-colors hover:bg-surface-muted"
          >
            Decline non-essential
          </button>
          <button
            type="button"
            onClick={() => choose("accepted")}
            className="rounded-full bg-brand-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-800"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
