import { NextResponse, type NextRequest } from "next/server";

// Two responsibilities, deliberately combined in one file since they run on
// every request:
//
// 1. Lightweight route protection for /admin/*: this only checks whether the
//    session cookie is present, since middleware runs on the Edge runtime
//    and can't safely hold a Postgres connection. The real validation
//    (hash lookup, expiry, idle timeout, sliding window) happens in
//    lib/session.ts's getSessionFromCookie(), called from the Node-runtime
//    (protected) layout. A present-but-invalid/expired cookie still reaches
//    the layout, which redirects to /admin/login — this is a fast-path
//    optimization, not the source of truth.
// 2. Security headers (CSP + friends) on every response, site-wide.

const SESSION_COOKIE_NAME = "nbc_admin_session";

const PUBLIC_ADMIN_PATHS = [
  "/admin/login",
  "/admin/forgot-password",
  "/admin/reset-password",
  "/admin/verify",
  "/admin/session-timeout",
];

function isPublicAdminPath(pathname: string): boolean {
  return PUBLIC_ADMIN_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

// Known third-party embeds actually used by this site (see plan): Google
// Fonts, YouTube embeds, Mixlr livestream, Google Maps/Meet, Google
// Analytics (gtag), consentmanager. Reasonably permissive on these specific
// hosts, default-deny (self-only) everything else.
//
// 'unsafe-eval' is added to script-src only outside production — Next.js
// dev mode (Turbopack HMR, React's dev-mode callstack reconstruction) uses
// eval() for debugging and is blocked entirely without it; React never uses
// eval() in a production build, so prod keeps the stricter policy.
const CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "form-action 'self'",
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV !== "production" ? " 'unsafe-eval'" : ""} https://www.googletagmanager.com https://www.google-analytics.com https://consentcdn.cookiebot.com https://cdn.consentmanager.net`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: https: blob:",
  "media-src 'self' https:",
  "connect-src 'self' https://www.google-analytics.com https://rccgtnbc.mixlr.com https://*.mixlr.com wss://*.mixlr.com https://cdn.consentmanager.net",
  "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://www.google.com https://meet.google.com https://consentcdn.cookiebot.com",
].join("; ");

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && !isPublicAdminPath(pathname)) {
    const hasSessionCookie = request.cookies.has(SESSION_COOKIE_NAME);
    if (!hasSessionCookie) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  const response = NextResponse.next();

  response.headers.set("Content-Security-Policy", CSP);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  );

  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    );
  }

  return response;
}

export const config = {
  matcher: [
    // Run on everything except static assets and Next.js internals.
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
