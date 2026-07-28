import { NextResponse, type NextRequest } from "next/server";

// Two responsibilities, deliberately combined in one file since they run on
// every request:
//
// 1. Lightweight route protection for /admin/*: this only checks whether the
//    session cookie is present — the real validation (hash lookup, expiry,
//    idle timeout, sliding window) happens in lib/session.ts's
//    getSessionFromCookie(), called from the (protected) layout. A
//    present-but-invalid/expired cookie still reaches the layout, which
//    redirects to /admin/login — this is a fast-path optimization, not the
//    source of truth.
// 2. Security headers (CSP + friends) on every response, site-wide.
//
// Renamed from middleware.ts (Next.js 16 deprecated that file convention in
// favor of proxy.ts — see https://nextjs.org/docs/messages/middleware-to-proxy).
// This isn't just a rename for its own sake: repeated production deploys of
// a middleware.ts that was independently verified byte-for-byte correct
// (direct inspection of the compiled Edge bundle, confirmed clean both
// locally and via GitHub's raw source) still crashed identically in
// production as MIDDLEWARE_INVOCATION_FAILED / "ReferenceError: __dirname
// is not defined" — a try/catch wrapping the entire function body never
// even caught it, meaning the crash happened before the function was ever
// invoked, from something the deprecated middleware.ts compatibility shim
// pulls in that's outside this file's own control. Proxy is the actively
// maintained code path (and per Next's own docs, defaults to the Node.js
// runtime rather than Edge as of v16), not a backward-compatibility shim
// for a deprecated convention.
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

// www.thenewbreedchurch.org is canonical (matches SITE_URL in lib/metadata.ts) —
// the apex domain must redirect there rather than serve identical content on
// both hosts, or Google splits ranking/link-equity between two copies of the
// same site. 308 (permanent) so search engines transfer ranking, not 307.
const APEX_HOST = "thenewbreedchurch.org";
const CANONICAL_HOST = "www.thenewbreedchurch.org";

// Toggle by setting MAINTENANCE_MODE=true on Render and redeploying (this is
// Edge middleware, so process.env references get inlined at build time —
// there's no instant runtime toggle without adding a DB/Redis dependency
// here, which would defeat the point: this has to keep working even if
// whatever's being worked on is the database itself). /admin stays reachable
// throughout so staff aren't locked out of everything else while it's on.
const MAINTENANCE_MODE = process.env.MAINTENANCE_MODE === "true";

// Self-contained on purpose — no images, no fonts, no data fetch of any
// kind. If maintenance mode is on because something deeper is broken, this
// page still has to render correctly regardless.
const MAINTENANCE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>We&#8217;ll be right back — The New Breed Church</title>
<style>
  body { margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center; background:#0b0b12; color:#fff; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; text-align:center; padding:2rem; }
  .card { max-width:28rem; }
  .badge { display:block; margin-bottom:1.5rem; font-size:0.8rem; letter-spacing:0.05em; text-transform:uppercase; color:#a78bfa; }
  h1 { font-size:1.75rem; font-weight:700; margin:0 0 0.75rem; }
  p { color:rgba(255,255,255,0.7); line-height:1.6; margin:0; }
</style>
</head>
<body>
  <div class="card">
    <span class="badge">The New Breed Church</span>
    <h1>We&#8217;ll be right back</h1>
    <p>We&#8217;re making some improvements to our site right now. Please check back shortly — thank you for your patience.</p>
  </div>
</body>
</html>`;

function maintenanceResponse(): NextResponse {
  return new NextResponse(MAINTENANCE_HTML, {
    status: 503,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "retry-after": "3600",
    },
  });
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (MAINTENANCE_MODE && !pathname.startsWith("/admin")) {
    return maintenanceResponse();
  }

  if (request.headers.get("host") === APEX_HOST) {
    const url = new URL(request.url);
    url.host = CANONICAL_HOST;
    return NextResponse.redirect(url, 308);
  }

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
  // btoa() rather than Buffer.from(...).toString("base64") — a Web Standard
  // global works in both the Node.js and Edge runtimes, so this is safe
  // regardless of which one Proxy actually executes under.
  const nonce = isProd ? btoa(crypto.randomUUID()) : undefined;

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
  runtime: "experimental-edge",
  matcher: [
    // Run on everything except static assets and Next.js internals.
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
