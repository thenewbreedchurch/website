"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, LayoutDashboard, LogOut, ExternalLink } from "lucide-react";
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
        "flex items-center gap-3 rounded-none px-3 py-2.5 text-sm font-medium transition-colors",
        isActive
          ? "bg-brand-600/25 text-white"
          : "text-white/65 hover:bg-white/5 hover:text-white"
      )}
    >
      <Icon
        size={17}
        className={isActive ? "text-brand-300" : "text-white/40"}
      />
      {label}
    </Link>
  );
}

// useFormStatus only reads pending state for the <form> it's rendered
// inside of, so this has to be a separate child component of the logout
// form rather than read inline in SidebarContent.
function LogoutButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={() => console.clear()}
      className="flex w-full items-center gap-2 rounded-none px-3 py-2.5 text-sm font-medium text-white/65 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-50"
    >
      <LogOut size={16} /> {pending ? "Logging out…" : "Log out"}
    </button>
  );
}

function SidebarContent({ email, onNavigate }: { email: string; onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-2 pb-2">
        <Link href="/admin" onClick={onNavigate} className="flex flex-1 items-center gap-2.5 min-w-0">
          <Image src="/logo-mark.png" alt="" width={166} height={160} className="h-8 w-8 shrink-0" unoptimized />
          <div className="min-w-0">
            <p className="truncate font-display text-base font-bold uppercase leading-none tracking-tight text-white">TNBC Admin</p>
            <p className="t-eyebrow mt-1 truncate text-[10px] text-white/45">The New Breed Church</p>
          </div>
        </Link>
        <ThemeToggle />
      </div>

      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="mx-2 flex items-center gap-2 rounded-none border border-white/20 px-3 py-2.5 text-sm font-medium text-white/75 transition-colors hover:bg-white/10 hover:text-white"
      >
        <ExternalLink size={16} className="text-white/45" />
        View Public Site
      </a>

      <nav className="mt-4 flex-1 space-y-6 overflow-y-auto px-2">
        <NavLink href="/admin" label="Dashboard" icon={LayoutDashboard} onNavigate={onNavigate} />
        {ADMIN_NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="t-eyebrow px-3 text-[10px] text-brand-300/80">
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

      <div className="border-t border-white/10 px-2 pt-3">
        <p className="t-eyebrow truncate px-3 text-[10px] text-white/50">{email}</p>
        <form action={logoutAction} className="mt-1.5">
          <LogoutButton />
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
      <aside className="hidden w-64 shrink-0 border-r border-white/10 bg-night px-2 py-4 text-white lg:block">
        <SidebarContent email={email} />
      </aside>

      {/* Mobile: hamburger trigger + slide-out drawer */}
      <div className="flex items-center justify-between border-b border-white/10 bg-night px-4 py-3 text-white lg:hidden">
        <Link href="/admin" className="flex items-center gap-2">
          <Image src="/logo-mark.png" alt="" width={166} height={160} className="h-7 w-7" unoptimized />
          <span className="font-display text-base font-bold uppercase tracking-tight text-white">TNBC Admin</span>
        </Link>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-none text-white/75 hover:bg-white/10"
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
              className="absolute inset-y-0 left-0 w-72 max-w-[85vw] overflow-y-auto bg-night px-2 py-4 text-white shadow-xl"
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
