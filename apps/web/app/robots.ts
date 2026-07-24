import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/metadata";

// Native App Router convention — replaces the legacy site's static
// client/robots.txt with a generated one that points at the real production
// domain (same SITE_URL source used for canonical/OG tags in lib/metadata.ts)
// and keeps /admin out of the index.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/admin",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
