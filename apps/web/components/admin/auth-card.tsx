import Image from "next/image";
import Link from "next/link";

// Shared chrome for every public auth page (login, forgot-password,
// reset-password, verify, session-timeout) — a borderless, left-aligned
// column sitting directly on the page background, no card/shadow. The
// branded logo lives in the (auth) layout's left gradient panel on wide
// screens (lg:hidden here avoids showing it twice); on narrower screens,
// where that panel is hidden, it's shown inline above the heading instead.
//
// Deliberately stays on neutral-*/brand-* (with explicit dark: companions)
// rather than the public site's surface/border/current tokens, which flip
// on the raw OS media query regardless of the admin theme toggle's explicit
// .dark class — see components/admin/theme-toggle.tsx and app/admin/layout.tsx.
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
        className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100"
        style={{ fontFamily: "var(--font-body), ui-sans-serif, system-ui, sans-serif" }}
      >
        {title}
      </h1>
      {subtitle && <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">{subtitle}</p>}
      <div className="mt-8">{children}</div>
    </div>
  );
}
