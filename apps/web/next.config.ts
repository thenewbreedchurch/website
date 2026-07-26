import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    formats: ["image/avif", "image/webp"],
  },
  turbopack: {
    // Pins the workspace root to this app instead of Next inferring it from
    // whichever lockfile is nearest up the tree — this machine has an
    // unrelated project with its own package-lock.json a few directories up.
    root: path.join(__dirname, "..", ".."),
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
