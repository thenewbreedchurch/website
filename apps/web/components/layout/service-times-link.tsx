"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { PENDING_SCROLL_KEY } from "./hash-scroll";

/**
 * Scrolls to the weekly service times on the home page without adding `#weekly`
 * to the address (a leftover hash made every later refresh jump back to it).
 * The href still points at /#weekly so middle-click, "open in new tab" and
 * no-JavaScript visitors work too.
 */
export function ServiceTimesLink({ className, children }: { className?: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  function onClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    if (pathname === "/") {
      document.getElementById("weekly")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.sessionStorage.setItem(PENDING_SCROLL_KEY, "weekly");
      router.push("/");
    }
  }

  return (
    <Link href="/#weekly" onClick={onClick} className={className}>
      {children}
    </Link>
  );
}
