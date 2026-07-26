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
  output: "standalone",
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
