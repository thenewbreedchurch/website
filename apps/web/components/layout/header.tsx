import Link from "next/link";
import Image from "next/image";
import { MobileNav } from "./mobile-nav";

// wearethenew.org-style chrome: a quiet dark bar with the logo and a single
// MENU button. All navigation lives in the full-screen overlay (MobileNav,
// now used at every breakpoint).
export function Header({
  instagramUrl,
  youtubeUrl,
}: {
  instagramUrl?: string | null;
  youtubeUrl?: string | null;
}) {
  return (
    <header className="sticky top-0 z-50 bg-night text-white">
      <div className="flex h-18 items-center justify-between px-4 sm:px-6 lg:px-9">
        <Link
          href="/"
          aria-label="The New Breed Church — home"
          className="flex items-center gap-2.5"
        >
          <Image
            src="/logo-mark.png"
            alt=""
            width={166}
            height={160}
            className="h-10 w-auto sm:h-12"
            priority
            unoptimized
          />
          <Image
            src="/logo-wordmark.png"
            alt="The New Breed Church"
            width={467}
            height={160}
            className="h-10 w-auto brightness-0 invert sm:h-12"
            priority
            unoptimized
          />
        </Link>
        <MobileNav instagramUrl={instagramUrl} youtubeUrl={youtubeUrl} />
      </div>
    </header>
  );
}
