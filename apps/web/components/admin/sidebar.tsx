"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LayoutDashboard, LogOut } from "lucide-react";
import { ADMIN_NAV_GROUPS } from "@/lib/admin-nav";
import { logoutAction } from "@/actions/admin-auth";
import { cn } from "@/lib/utils";

// neutral-*/brand-* only in this whole tree — the admin shell forces
// colorScheme: light (app/admin/layout.tsx) with no dark-mode design, so the
// public site's surface/border/current tokens (which flip with OS
// prefers-color-scheme) would silently break legibility here. Learned the
// hard way in an earlier round; don't reintroduce it.

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
          ? "bg-brand-50 text-brand-700"
          : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
      )}
    >
      <Icon size={17} className={isActive ? "text-brand-700" : "text-neutral-400"} />
      {label}
    </Link>
  );
}

function SidebarContent({ email, onNavigate }: { email: string; onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <Link href="/admin" onClick={onNavigate} className="flex items-center gap-2.5 px-2 pb-2">
        <Image src="/logo-mark.png" alt="" width={166} height={160} className="h-8 w-8 shrink-0" />
        <div>
          <p className="text-sm font-bold text-brand-800">NBC Admin</p>
          <p className="text-[11px] text-neutral-400">The New Breed Church</p>
        </div>
      </Link>

      <nav className="mt-4 flex-1 space-y-6 overflow-y-auto px-2">
        <NavLink href="/admin" label="Dashboard" icon={LayoutDashboard} onNavigate={onNavigate} />
        {ADMIN_NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
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

      <div className="border-t border-neutral-200 px-2 pt-3">
        <p className="truncate px-3 text-xs text-neutral-500">{email}</p>
        <form action={logoutAction} className="mt-1.5">
          <button
            type="submit"
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
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

  return (
    <>
      {/* Desktop: fixed sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-neutral-200 bg-white px-2 py-4 lg:block">
        <SidebarContent email={email} />
      </aside>

      {/* Mobile: hamburger trigger + slide-out drawer */}
      <div className="flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-3 lg:hidden">
        <Link href="/admin" className="flex items-center gap-2">
          <Image src="/logo-mark.png" alt="" width={166} height={160} className="h-7 w-7" />
          <span className="text-sm font-bold text-brand-800">NBC Admin</span>
        </Link>
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-100"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] overflow-y-auto bg-white px-2 py-4 shadow-xl">
            <SidebarContent email={email} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
