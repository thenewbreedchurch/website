import Image from "next/image";
import Link from "next/link";

// Shared chrome for every public auth page (login, forgot-password,
// reset-password, verify, session-timeout) — a borderless, left-aligned
// column sitting directly on the page background, no card/shadow. The
// branded logo lives in the (auth) layout's left gradient panel on wide
// screens (lg:hidden here avoids showing it twice); on narrower screens,
// where that panel is hidden, it's shown inline above the heading instead.
//
// Deliberately stays on the admin panel's existing "always light"
// neutral-*/brand-* palette rather than the public site's surface/border/
// current tokens — those flip with prefers-color-scheme, and the admin
// shell forces colorScheme: light (see app/admin/layout.tsx), so theme
// tokens would silently invert here on a dark-mode OS. brand-* is a safe,
// non-flipping palette (see globals.css — only background/foreground/
// surface/border change in the dark media block).
export function AuthCard({
  title,
  subtitle,
  center = false,
  children,
}: {
  title: string;
  subtitle?: string;
  center?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={center ? "text-center" : ""}>
      <Link
        href="/"
        aria-label="The New Breed Church — home"
        className={`mb-8 inline-flex items-center gap-2 lg:hidden ${center ? "justify-center" : ""}`}
      >
        <Image src="/logo-mark.png" alt="" width={166} height={160} className="h-10 w-auto" />
        <Image
          src="/logo-wordmark.png"
          alt="The New Breed Church"
          width={467}
          height={160}
          className="h-5 w-auto"
        />
      </Link>
      <h1
        className="text-3xl font-bold tracking-tight text-neutral-900"
        style={{ fontFamily: "var(--font-body), ui-sans-serif, system-ui, sans-serif" }}
      >
        {title}
      </h1>
      {subtitle && <p className="mt-2 text-sm text-neutral-500">{subtitle}</p>}
      <div className="mt-8">{children}</div>
    </div>
  );
}
