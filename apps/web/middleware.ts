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

// Every third-party host below is confirmed actually referenced in the
// current codebase (grepped, not assumed) — Google Analytics/gtag, Mixlr,
// Cookiebot, consentmanager.net, Google Fonts CDN, and Google Maps/Meet
// frame embeds were all previously allowlisted here but are unused today
// (fonts are self-hosted via next/font; the only iframe embed anywhere in
// the app is the YouTube sermon player; consent is handled by the site's
// own first-party banner, not a third-party script) — removed rather than
// left as unnecessary attack surface.
const FRAME_SRC_HOSTS = "https://www.youtube.com https://www.youtube-nocookie.com";

function buildCsp(nonce: string | undefined): string {
  const isProd = process.env.NODE_ENV === "production";
  // In production, only the exact per-request nonce may run inline scripts
  // (the two JSON-LD structured-data tags — see lib/metadata.ts's
  // safeJsonLdString) or a self-hosted script file; nothing else. In dev,
  // Turbopack HMR and React's dev-mode tooling need 'unsafe-eval' and rely
  // on inline scripts too, so this keeps the permissive dev policy already
  // in place rather than fighting local tooling for no real security gain
  // (dev builds are never what a real visitor loads).
  const scriptSrc = isProd
    ? `script-src 'self' 'nonce-${nonce}'`
    : "script-src 'self' 'unsafe-inline' 'unsafe-eval'";

  return [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'self'",
    "form-action 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self'",
    "img-src 'self' data: https: blob:",
    "media-src 'self' https:",
    "connect-src 'self'",
    `frame-src 'self' ${FRAME_SRC_HOSTS}`,
  ].join("; ");
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && !isPublicAdminPath(pathname)) {
    const hasSessionCookie = request.cookies.has(SESSION_COOKIE_NAME);
    if (!hasSessionCookie) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  const isProd = process.env.NODE_ENV === "production";
  // Only minted in production, where it's actually load-bearing — dev keeps
  // 'unsafe-inline' so no nonce plumbing is needed there. Base64-encoding a
  // fresh UUID per request, per Next.js's own documented App Router nonce
  // pattern: enough entropy to be unguessable, and Next.js automatically
  // applies the same nonce to its own internal inline scripts once it sees
  // one in the CSP header, so this is the only wiring needed beyond passing
  // it to the two app-authored inline scripts via the `x-nonce` header.
  const nonce = isProd ? Buffer.from(crypto.randomUUID()).toString("base64") : undefined;

  const requestHeaders = new Headers(request.headers);
  if (nonce) requestHeaders.set("x-nonce", nonce);

  const response = NextResponse.next({ request: { headers: requestHeaders } });

  response.headers.set("Content-Security-Policy", buildCsp(nonce));
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  );

  if (isProd) {
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
