"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { NAV_LINKS, GIVE_LINK } from "@/lib/nav-links";
import { cn } from "@/lib/utils";
import { MobileNav } from "./mobile-nav";

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-surface/90 backdrop-blur supports-[backdrop-filter]:bg-surface/70">
      <div className="relative mx-auto flex h-18 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="The New Breed Church — home" className="flex items-center gap-2.5">
          <Image
            src="/logo-mark.png"
            alt=""
            width={166}
            height={160}
            className="h-10 w-auto sm:h-12"
            priority
          />
          <Image
            src="/logo-wordmark.png"
            alt="The New Breed Church"
            width={467}
            height={160}
            className="h-6 w-auto dark:invert sm:h-7"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "rounded-full px-3 py-2 text-sm font-medium transition-colors hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-white/5 dark:hover:text-brand-300",
                  isActive ? "bg-brand-50 text-brand-700 dark:bg-white/10 dark:text-brand-300" : "text-current/80"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={GIVE_LINK.href}
            className="hidden rounded-full bg-brand-700 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-800 md:inline-flex"
          >
            {GIVE_LINK.label}
          </Link>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
