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
  "/directory",
  "/directory/browse",
  "/directory/list-your-business",
];

// Built per request, not at `next build`: the Docker build runs BEFORE the
// container-start migrations (scripts/entrypoint.sh), so on a deploy that adds
// tables the build-time database doesn't have them yet — querying vendors then
// crashed the build ("table public.Vendor does not exist"). Search engines
// fetch the sitemap rarely, so a live query is cheap.
export const dynamic = "force-dynamic";

// Sitemaps are one of the few places a full-table read is the correct
// call (Google needs every published URL), but it's still capped well
// above any realistic table size for this church site rather than left
// truly unbounded.
const MAX_ENTRIES_PER_MODEL = 5000;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [sermons, announcements, vendors] = await Promise.all([
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
    prisma.vendor
      .findMany({
        where: { status: "APPROVED" },
        select: { slug: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
        take: MAX_ENTRIES_PER_MODEL,
      })
      // Never let a directory problem take down the whole sitemap.
      .catch(() => [] as { slug: string; updatedAt: Date }[]),
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

  const vendorEntries: MetadataRoute.Sitemap = vendors.map((vendor) => ({
    url: `${SITE_URL}/directory/${vendor.slug}`,
    lastModified: vendor.updatedAt,
  }));

  return [...staticEntries, ...sermonEntries, ...announcementEntries, ...vendorEntries];
}
