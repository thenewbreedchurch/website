"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

const THEME_COOKIE = "nbc_theme";

// No cookie means "never chosen" — fall back to whatever the .dark/.light
// class (set server-side from the cookie) or, failing that, the live OS
// preference currently resolves to. Mirrors the fallback chain in
// app/layout.tsx and globals.css so the toggle's notion of "current theme"
// never disagrees with what's actually on screen.
function getEffectiveTheme(): "light" | "dark" {
  const root = document.documentElement;
  if (root.classList.contains("dark")) return "dark";
  if (root.classList.contains("light")) return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

// useSyncExternalStore (rather than useState+useEffect) so the button's icon
// stays correct if the class changes from outside this component — e.g. the
// OS preference changing live while no explicit choice has been made yet —
// without ever calling setState from inside an effect.
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", onChange);
  return () => {
    observer.disconnect();
    media.removeEventListener("change", onChange);
  };
}

// The server has no way to know the OS preference or DOM class, so it
// renders nothing (a placeholder) until the client snapshot resolves post-
// hydration — avoids a hydration mismatch and a flashed-then-flipped icon.
function getServerSnapshot(): "light" | "dark" | null {
  return null;
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getEffectiveTheme, getServerSnapshot);

  function toggle() {
    const next = getEffectiveTheme() === "dark" ? "light" : "dark";
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(next);
    // Scoped to /admin only — this is an admin-only feature, and the public
    // site already has its own automatic (OS-driven) dark mode via
    // surface/border/current tokens that this must not interfere with. Also
    // clear any stray root-scoped cookie of the same name (e.g. from an
    // earlier build that didn't scope the path) — same-named cookies at
    // different paths coexist in the jar, and whichever the browser sends
    // first wins, which can silently pin the wrong theme.
    document.cookie = `${THEME_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
    document.cookie = `${THEME_COOKIE}=${next}; path=/admin; max-age=31536000; SameSite=Lax`;
  }

  if (theme === null) {
    return <span className="inline-block h-9 w-9 shrink-0" aria-hidden />;
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
    >
      {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}
