"use client";

import { useEffect } from "react";
import type { VendorStatType } from "@nb-church/db";

function send(vendorId: string, type: VendorStatType) {
  const body = JSON.stringify({ vendorId, type });
  try {
    if (navigator.sendBeacon?.("/api/directory/track", new Blob([body], { type: "application/json" }))) return;
  } catch {
    // fall through to fetch
  }
  void fetch("/api/directory/track", { method: "POST", body, keepalive: true, headers: { "Content-Type": "application/json" } }).catch(() => {});
}

/** An <a> that reports a contact tap (call / WhatsApp / email / website / social) without delaying navigation. */
export function TrackedLink({
  vendorId,
  type,
  className,
  children,
  ...props
}: { vendorId: string; type: Exclude<VendorStatType, "VIEW"> } & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a {...props} className={className} onClick={(e) => { props.onClick?.(e); send(vendorId, type); }}>
      {children}
    </a>
  );
}

/** Records one profile view per vendor per browser session. Renders nothing. */
export function ViewTracker({ vendorId }: { vendorId: string }) {
  useEffect(() => {
    const key = `dirview:${vendorId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // storage unavailable — count the view anyway
    }
    send(vendorId, "VIEW");
  }, [vendorId]);
  return null;
}
