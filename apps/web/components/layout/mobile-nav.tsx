"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { NAV_LINKS, GIVE_LINK } from "@/lib/nav-links";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/lib/motion";

// Full-screen menu overlay at every breakpoint (wearethenew.org pattern):
// huge stacked display links on the left, a photo + primary action + mono
// social links on the right.
export function MobileNav({
  instagramUrl,
  youtubeUrl,
}: {
  instagramUrl?: string | null;
  youtubeUrl?: string | null;
}) {
  const [open, setOpen] = useState(false);
  // Index into NAV_LINKS of the link being hovered/focused (-1 = Give).
  const [preview, setPreview] = useState<number | null>(null);
  const pathname = usePathname();
  const reducedMotion = usePrefersReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);

  // Lock page scroll while open, Esc to dismiss (links close it via onClick).
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const currentIndex = NAV_LINKS.findIndex((l) => l.href === pathname);
  const previewLink =
    preview === null
      ? NAV_LINKS[Math.max(currentIndex, 0)]
      : (NAV_LINKS[preview] ?? GIVE_LINK);
  const previewSrc = previewLink?.image ?? NAV_LINKS[0].image!;

  const socials = [
    instagramUrl && { label: "Instagram", href: instagramUrl },
    youtubeUrl && { label: "YouTube", href: youtubeUrl },
  ].filter((s): s is { label: string; href: string } => Boolean(s));

  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        aria-controls="site-menu"
        onClick={() => setOpen(true)}
        className="t-eyebrow border border-white/25 px-4 py-3 text-white transition-colors hover:bg-white hover:text-night"
      >
        Menu
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id="site-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.25 }}
            className="fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-night text-white"
          >
            <div className="flex h-18 shrink-0 items-center justify-between px-4 sm:px-6 lg:px-9">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                aria-label="The New Breed Church — home"
                className="flex items-center gap-2.5"
              >
                <Image src="/logo-mark.png" alt="" width={166} height={160} className="h-10 w-auto sm:h-12" />
                <Image
                  src="/logo-wordmark.png"
                  alt=""
                  width={467}
                  height={160}
                  className="h-10 w-auto brightness-0 invert sm:h-12"
                />
              </Link>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setOpen(false)}
                className="t-eyebrow border border-white/25 px-4 py-3 transition-colors hover:bg-white hover:text-night"
              >
                Close
              </button>
            </div>

            <div className="flex flex-1 flex-col justify-between gap-10 px-4 pb-8 pt-4 sm:px-6 lg:grid lg:grid-cols-[1fr_24rem] lg:content-center lg:gap-14 lg:px-9 lg:pb-16 lg:pt-0">
              <nav aria-label="Primary" className="flex flex-col lg:self-center" onMouseLeave={() => setPreview(null)}>
                {NAV_LINKS.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={reducedMotion ? false : { opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * i, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      onMouseEnter={() => setPreview(i)}
                      onFocus={() => setPreview(i)}
                      aria-current={pathname === link.href ? "page" : undefined}
                      className={cn(
                        "t-display-sm block py-2 text-[clamp(1.75rem,8vw,2.25rem)]! transition-colors hover:text-brand-300 focus-visible:text-brand-300 sm:py-[1.1vh] sm:text-[clamp(1.35rem,4.6vh,2.5rem)]! md:text-[clamp(1.6rem,5vh,3.25rem)]! lg:text-[clamp(1.35rem,4.6vh,2.5rem)]!",
                        pathname === link.href ? "text-brand-300" : "text-white/55"
                      )}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <div className="space-y-6 lg:pt-3">
                <div className="relative hidden aspect-[5/4] max-h-[42vh] w-full overflow-hidden bg-brand-950 lg:block">
                  <AnimatePresence initial={false}>
                    <motion.div
                      key={previewSrc}
                      className="absolute inset-0"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: reducedMotion ? 0 : 0.35 }}
                    >
                      <Image
                        src={previewSrc}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 24rem, 100vw"
                        className="object-cover"
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>
                <Link
                  href={GIVE_LINK.href}
                  onClick={() => setOpen(false)}
                  onMouseEnter={() => setPreview(NAV_LINKS.length)}
                  onFocus={() => setPreview(NAV_LINKS.length)}
                  className="block bg-brand-600 px-6 py-4 text-center text-sm font-bold uppercase tracking-tight text-white transition-colors hover:bg-brand-500"
                >
                  {GIVE_LINK.label}
                </Link>
                {socials.length > 0 && (
                  <div className="t-eyebrow flex justify-between text-white/70">
                    {socials.map((s) => (
                      <a
                        key={s.label}
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-white"
                      >
                        {s.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
