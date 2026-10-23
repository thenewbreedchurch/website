"use client";

import { useEffect } from "react";

/** Registers the offline-fallback service worker (see public/sw.js). No UI. */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
      // Registration can fail in private windows or on insecure origins — the
      // site works exactly the same without it, just no offline page.
    });
  }, []);
  return null;
}
