import type { NextConfig } from "next";

// No `turbopack.root` override here on purpose — it used to pin the
// workspace root via `path.join(__dirname, ...)` to work around an
// unrelated project's lockfile a few directories up on one contributor's
// machine. That's a one-machine cosmetic convenience (Next just guesses a
// workspace root and warns if it's unsure — harmless either way), but
// `__dirname` is a Node.js global and this config file is also traced for
// the Edge Runtime middleware bundle, which doesn't provide it. A version
// of this gated to `NODE_ENV !== "production"` still shipped and 500'd
// every request in prod as MIDDLEWARE_INVOCATION_FAILED
// ("ReferenceError: __dirname is not defined") — Turbopack's file tracer
// flags this config on *static* presence of `path.join`/`__dirname` in the
// source, not on whether a runtime branch would actually reach it, so a
// runtime-only guard isn't a reliable enough fix. Removing the property
// (and the `node:path` import) entirely is the only way to be sure a
// Node-only global never has a path into any Edge-traced bundle. If the
// local workspace-root warning bothers you, silence it in your own
// untracked shell config instead of reintroducing this here.
const nextConfig: NextConfig = {
  // "standalone" packages a self-contained Node server + only the deps it
  // actually needs — required for apps/web/Dockerfile's production stage
  // and local docker-compose (see HANDOFF.md). Vercel has its own build
  // output format entirely (the Build Output API) and doesn't need this at
  // all; every one of Vercel's build environments sets VERCEL=1
  // automatically, so this only activates for the Docker/self-host path.
  // Left set unconditionally, the two output formats appear to conflict —
  // real symptom, confirmed live: every route on Vercel started 404ing
  // (NOT_FOUND) the moment this build first ran the new proxy.ts (Next.js
  // 16's Node.js-runtime-by-default replacement for middleware.ts), despite
  // that same combination working fine locally in `output: standalone`
  // Docker builds. This is a plain config value, not a dynamic
  // path.join(__dirname, ...) call like the turbopack.root issue earlier in
  // this file's history — an env-conditional here carries none of that
  // risk, since there's no Node-only global for a bundler to statically
  // trace into an Edge chunk.
  output: process.env.VERCEL ? undefined : "standalone",
  images: {
    formats: ["image/avif", "image/webp"],
    // Sermon thumbnails auto-derive from YouTube when an admin leaves
    // thumbnailUrl blank (lib/youtube.ts's youtubeThumbnailUrl, used by
    // components/sermons/sermon-card.tsx) — next/image refuses to optimize
    // any external host that isn't explicitly allow-listed here. i.ytimg.com
    // is the only hostname that helper ever returns (youtubeEmbedUrl's
    // youtube-nocookie.com URL is only ever used as an <iframe> src, never
    // passed to next/image, so it doesn't need a remotePattern).
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com", pathname: "/vi/**" },
      // Admin-uploaded images (see actions/admin/upload.ts, lib/r2.ts) land
      // in a Cloudflare R2 bucket at this host. R2_PUBLIC_URL is only set
      // once real R2 credentials are configured, so this is conditionally
      // omitted rather than given a placeholder — local/dev builds without
      // R2 configured don't need one. Uses the global `URL` constructor
      // (not a `node:url` import) — Edge-safe, same pattern middleware.ts
      // already uses for its apex-to-www redirect, so this can't reintroduce
      // the __dirname-in-Edge-bundle class of bug this file's history
      // already warns about above.
      ...(process.env.R2_PUBLIC_URL
        ? [{ protocol: "https" as const, hostname: new URL(process.env.R2_PUBLIC_URL).hostname }]
        : []),
    ],
    // These are static content images that only change via a new admin
    // upload + deploy, not per-request — the Next.js default (60s) means
    // the optimizer cache expires and regenerates AVIF/WebP variants
    // constantly under normal traffic, burning CPU on Render's 0.5 CPU
    // Starter tier for no benefit. A long TTL is safe here.
    minimumCacheTTL: 31536000, // 1 year
  },
  // Belt-and-suspenders for the standalone Docker build: `sharp` (added as
  // a real apps/web dependency, see package.json) is required by Next's
  // built-in image optimizer in any self-hosted deployment — without it,
  // every image request falls back to a much slower, unoptimized path,
  // which is what was actually causing 5-8s image loads and, by starving
  // the single small Render instance's CPU, made unrelated clicks
  // (nav, breadcrumbs, the admin dark-mode toggle) feel laggy too. Normal
  // Node File Trace should already pick sharp up now that it's a real
  // dependency, but this forces it into the traced output regardless, at
  // zero cost if already found — see the Dockerfile's build-time assertion
  // for the check that verifies this actually worked.
  outputFileTracingIncludes: {
    "/_next/image": ["./node_modules/sharp/**/*"],
  },
  // Server Actions default to a 1MB request-body cap — too small for the
  // admin image-upload feature (actions/admin/upload.ts), where a typical
  // unedited phone photo is 3-10MB. 10mb leaves headroom over that action's
  // own 8MB file-size validation for multipart boundary/field overhead, per
  // Next's own sizing guidance.
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  // Preserves SEO/link equity from the legacy flat-file static site (see
  // _legacy-static-site/client/*.html) on domain cutover — without these,
  // every old bookmark, backlink, and indexed Google result for the old
  // URLs 404s the moment DNS points here instead of at the legacy host.
  // 308/permanent so search engines transfer ranking to the new URLs.
  async redirects() {
    return [
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/about.html", destination: "/about", permanent: true },
      { source: "/donate.html", destination: "/give", permanent: true },
      { source: "/events.html", destination: "/announcements", permanent: true },
      { source: "/linktree.html", destination: "/linktree", permanent: true },
    ];
  },
};

export default nextConfig;
