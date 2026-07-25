"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, LayoutDashboard, LogOut } from "lucide-react";
import { ADMIN_NAV_GROUPS } from "@/lib/admin-nav";
import { logoutAction } from "@/actions/admin-auth";
import { ThemeToggle } from "@/components/admin/theme-toggle";
import { usePrefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

// neutral-*/brand-* only in this whole tree, never the public site's
// surface/border/current tokens (which flip on the raw OS media query
// regardless of a manual choice — learned the hard way in an earlier
// round). Dark mode here is instead driven by an explicit .dark class
// (see components/admin/theme-toggle.tsx + app/layout.tsx), so every one
// of those utilities gets a matching admin-dark: companion by hand.

function NavLink({ href, label, icon: Icon, onNavigate }: {
  href: string;
  label: string;
  icon: (typeof ADMIN_NAV_GROUPS)[number]["items"][number]["icon"];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-brand-50 text-brand-700 admin-dark:bg-brand-500/15 admin-dark:text-brand-300"
          : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 admin-dark:text-neutral-400 admin-dark:hover:bg-neutral-800 admin-dark:hover:text-neutral-100"
      )}
    >
      <Icon
        size={17}
        className={isActive ? "text-brand-700 admin-dark:text-brand-300" : "text-neutral-400 admin-dark:text-neutral-500"}
      />
      {label}
    </Link>
  );
}

function SidebarContent({ email, onNavigate }: { email: string; onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-2 pb-2">
        <Link href="/admin" onClick={onNavigate} className="flex flex-1 items-center gap-2.5 min-w-0">
          <Image src="/logo-mark.png" alt="" width={166} height={160} className="h-8 w-8 shrink-0" />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-brand-800 admin-dark:text-brand-300">TNBC Admin</p>
            <p className="truncate text-[11px] text-neutral-400 admin-dark:text-neutral-500">The New Breed Church</p>
          </div>
        </Link>
        <ThemeToggle />
      </div>

      <nav className="mt-4 flex-1 space-y-6 overflow-y-auto px-2">
        <NavLink href="/admin" label="Dashboard" icon={LayoutDashboard} onNavigate={onNavigate} />
        {ADMIN_NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wide text-neutral-400 admin-dark:text-neutral-500">
              {group.label}
            </p>
            <div className="mt-1.5 space-y-0.5">
              {group.items.map((item) => (
                <NavLink key={item.href} href={item.href} label={item.label} icon={item.icon} onNavigate={onNavigate} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-neutral-200 px-2 pt-3 admin-dark:border-neutral-800">
        <p className="truncate px-3 text-xs text-neutral-500 admin-dark:text-neutral-400">{email}</p>
        <form action={logoutAction} className="mt-1.5">
          <button
            type="submit"
            onClick={() => console.clear()}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 admin-dark:text-neutral-400 admin-dark:hover:bg-neutral-800 admin-dark:hover:text-neutral-100"
          >
            <LogOut size={16} /> Log out
          </button>
        </form>
      </div>
    </div>
  );
}

export function AdminSidebar({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  return (
    <>
      {/* Desktop: fixed sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-neutral-200 bg-white px-2 py-4 lg:block admin-dark:border-neutral-800 admin-dark:bg-neutral-900">
        <SidebarContent email={email} />
      </aside>

      {/* Mobile: hamburger trigger + slide-out drawer */}
      <div className="flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-3 lg:hidden admin-dark:border-neutral-800 admin-dark:bg-neutral-900">
        <Link href="/admin" className="flex items-center gap-2">
          <Image src="/logo-mark.png" alt="" width={166} height={160} className="h-7 w-7" />
          <span className="text-sm font-bold text-brand-800 admin-dark:text-brand-300">TNBC Admin</span>
        </Link>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-100 admin-dark:text-neutral-400 admin-dark:hover:bg-neutral-800"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.button
              type="button"
              aria-label="Close menu"
              className="absolute inset-0 bg-black/40"
              onClick={() => setOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
            <motion.div
              className="absolute inset-y-0 left-0 w-72 max-w-[85vw] overflow-y-auto bg-white px-2 py-4 shadow-xl admin-dark:bg-neutral-900"
              initial={reducedMotion ? { opacity: 0 } : { x: "-100%" }}
              animate={reducedMotion ? { opacity: 1 } : { x: 0 }}
              exit={reducedMotion ? { opacity: 0 } : { x: "-100%" }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <SidebarContent email={email} onNavigate={() => setOpen(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
