import type { MetadataRoute } from "next";
import { prisma } from "@nb-church/db";
import { SITE_URL } from "@/lib/metadata";

// Every public (site) route folder — kept in sync by hand since it's a
// short, slow-changing list; not worth a generated route manifest.
const STATIC_ROUTES = [
  "",
  "/about",
  "/first-timers",
  "/new-converts",
  "/announcements",
  "/sermons",
  "/give",
  "/contact",
  "/leadership",
];

// Sitemaps are one of the few places a full-table read is the correct
// call (Google needs every published URL), but it's still capped well
// above any realistic table size for this church site rather than left
// truly unbounded.
const MAX_ENTRIES_PER_MODEL = 5000;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [sermons, announcements] = await Promise.all([
    // Sermons have no draft/published flag in the schema — every row is
    // already public once created (see Sermon model in schema.prisma).
    prisma.sermon.findMany({
      select: { slug: true, updatedAt: true },
      orderBy: { publishedAt: "desc" },
      take: MAX_ENTRIES_PER_MODEL,
    }),
    prisma.announcement.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: MAX_ENTRIES_PER_MODEL,
    }),
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
  }));

  const sermonEntries: MetadataRoute.Sitemap = sermons.map((sermon) => ({
    url: `${SITE_URL}/sermons/${sermon.slug}`,
    lastModified: sermon.updatedAt,
  }));

  const announcementEntries: MetadataRoute.Sitemap = announcements.map((announcement) => ({
    url: `${SITE_URL}/announcements/${announcement.slug}`,
    lastModified: announcement.updatedAt,
  }));

  return [...staticEntries, ...sermonEntries, ...announcementEntries];
}
