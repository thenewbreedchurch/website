import Link from "next/link";
import Image from "next/image";
import { NAV_LINKS, GIVE_LINK } from "@/lib/nav-links";
import { MobileNav } from "./mobile-nav";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-surface/90 backdrop-blur supports-[backdrop-filter]:bg-surface/70">
      <div className="relative mx-auto flex h-18 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2" aria-label="The New Breed Church — home">
          <Image
            src="/logo.png"
            alt="The New Breed Church"
            width={40}
            height={40}
            className="h-10 w-10 object-contain"
            priority
          />
          <span className="hidden font-display text-lg font-semibold sm:inline">
            The New Breed Church
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-2 text-sm font-medium text-current/80 transition-colors hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-white/5 dark:hover:text-brand-300"
            >
              {link.label}
            </Link>
          ))}
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
