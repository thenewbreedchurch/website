import type { Metadata } from "next";

// Standalone shell for the entire /admin surface — deliberately no shared
// site Header/Footer (this is a distinct app, not a page of the public
// site). Auth-gated chrome (nav, logout button, inactivity watcher) lives
// one level down in app/admin/(protected)/layout.tsx, so public admin pages
// (login, forgot-password, reset-password, verify, session-timeout) stay
// bare.

export const metadata: Metadata = {
  title: "Admin — The New Breed Church",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900" style={{ colorScheme: "light" }}>
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4">{children}</div>
    </div>
  );
}
