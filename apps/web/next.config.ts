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
