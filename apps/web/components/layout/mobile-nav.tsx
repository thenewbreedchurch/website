"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { NAV_LINKS, GIVE_LINK } from "@/lib/nav-links";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/lib/motion";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full text-current"
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-nav-panel"
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-x-0 top-full z-40 border-t border-border bg-surface shadow-lg"
          >
            <nav className="flex flex-col p-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "rounded-lg px-4 py-3 text-base font-medium transition-colors hover:bg-brand-50 dark:hover:bg-white/5",
                    pathname === link.href && "text-brand-700 dark:text-brand-300"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href={GIVE_LINK.href}
                onClick={() => setOpen(false)}
                className="mt-2 rounded-full bg-brand-700 px-4 py-3 text-center text-base font-medium text-white hover:bg-brand-800"
              >
                {GIVE_LINK.label}
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
