import type { Metadata } from "next";

// Standalone shell for the entire /admin surface — deliberately no shared
// site Header/Footer (this is a distinct app, not a page of the public
// site). Auth-gated chrome (nav, logout button, inactivity watcher) lives
// one level down in app/admin/(protected)/layout.tsx, and the public auth
// pages (login, forgot-password, reset-password, verify, session-timeout)
// get their own full-bleed split-screen shell in app/admin/(auth)/layout.tsx
// — so this root layout stays a bare, unconstrained canvas and each route
// group owns its own width/padding rather than one shared constraint
// fighting both.
//
// This tree still deliberately sticks to neutral-*/brand-* (never the public
// site's surface/border/current tokens, which flip on the raw OS media query
// regardless of a manual choice) — but every one of those utilities now has
// an explicit admin-dark: companion, gated by the .dark class from the theme
// toggle in components/admin/sidebar.tsx. color-scheme is set the same way
// so native form controls (checkboxes, scrollbars) follow along too.

export const metadata: Metadata = {
  title: "Admin — The New Breed Church",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 text-neutral-900 [color-scheme:light] admin-dark:bg-neutral-950 admin-dark:text-neutral-100 admin-dark:[color-scheme:dark]">
      {children}
    </div>
  );
}
