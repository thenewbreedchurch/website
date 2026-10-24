import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { NotFoundView } from "@/components/layout/not-found-view";

export const metadata: Metadata = { title: "Page not found" };

// Root-level fallback for URLs that match no route at all (the (site) group's
// own not-found.tsx covers notFound() raised inside public pages, with the
// full site header/footer). No site chrome here since this layout also wraps
// /admin and /linktree.
export default function NotFound() {
  return (
    <>
      <header className="bg-night">
        <div className="flex h-18 items-center px-4 sm:px-6 lg:px-9">
          <Link href="/" aria-label="The New Breed Church — home" className="flex items-center gap-2.5">
            <Image src="/logo-mark.png" alt="" width={166} height={160} className="h-10 w-auto sm:h-12" unoptimized />
            <Image
              src="/logo-wordmark.png"
              alt="The New Breed Church"
              width={467}
              height={160}
              className="h-10 w-auto brightness-0 invert sm:h-12"
              unoptimized
            />
          </Link>
        </div>
      </header>
      <NotFoundView />
    </>
  );
}
