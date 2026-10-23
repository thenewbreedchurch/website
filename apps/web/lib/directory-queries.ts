import "server-only";
import { Prisma, prisma } from "@nb-church/db";
import { BROWSE_PAGE_SIZE, slugify } from "./directory";

export type BrowseSort = "featured" | "newest" | "rating" | "name";

export interface BrowseParams {
  q?: string;
  category?: string; // category slug
  subcategory?: string;
  location?: string;
  verified?: boolean;
  sort?: BrowseSort;
  page?: number;
}

const ORDER: Record<BrowseSort, Prisma.VendorOrderByWithRelationInput[]> = {
  featured: [{ isFeatured: "desc" }, { isVerified: "desc" }, { createdAt: "desc" }],
  newest: [{ createdAt: "desc" }],
  rating: [{ ratingAvg: "desc" }, { ratingCount: "desc" }, { businessName: "asc" }],
  name: [{ businessName: "asc" }],
};

export const vendorCardInclude = { category: { select: { name: true, slug: true } } } as const;
export type VendorCardData = Prisma.VendorGetPayload<{ include: typeof vendorCardInclude }>;

/** URL-driven, always-bounded vendor search for /marketplace/browse. Only APPROVED listings are ever public. */
export async function browseVendors(params: BrowseParams) {
  const q = params.q?.trim().slice(0, 80);
  const location = params.location?.trim().slice(0, 80);
  const page = Math.max(1, params.page ?? 1);

  const where: Prisma.VendorWhereInput = {
    status: "APPROVED",
    ...(params.category ? { category: { slug: params.category } } : {}),
    ...(params.subcategory ? { subcategory: { equals: params.subcategory, mode: "insensitive" } } : {}),
    ...(params.verified ? { isVerified: true } : {}),
    ...(location
      ? {
          OR: [
            { location: { contains: location, mode: "insensitive" } },
            { serviceAreas: { contains: location, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(q
      ? {
          AND: [
            {
              OR: [
                { businessName: { contains: q, mode: "insensitive" } },
                { description: { contains: q, mode: "insensitive" } },
                { subcategory: { contains: q, mode: "insensitive" } },
                { category: { name: { contains: q, mode: "insensitive" } } },
                { services: { has: q } },
              ],
            },
          ],
        }
      : {}),
  };

  const [vendors, total] = await Promise.all([
    prisma.vendor.findMany({
      where,
      orderBy: ORDER[params.sort ?? "featured"],
      take: BROWSE_PAGE_SIZE,
      skip: (page - 1) * BROWSE_PAGE_SIZE,
      include: vendorCardInclude,
    }),
    prisma.vendor.count({ where }),
  ]);

  return { vendors, total, page, totalPages: Math.max(1, Math.ceil(total / BROWSE_PAGE_SIZE)) };
}

export async function getDirectoryHome() {
  const approved = { status: "APPROVED" as const };
  const [featured, recent, categories, totalVendors, verifiedVendors] = await Promise.all([
    prisma.vendor.findMany({
      where: { ...approved, isFeatured: true },
      orderBy: [{ isVerified: "desc" }, { createdAt: "desc" }],
      take: 3,
      include: vendorCardInclude,
    }),
    prisma.vendor.findMany({ where: approved, orderBy: { createdAt: "desc" }, take: 8, include: vendorCardInclude }),
    prisma.vendorCategory.findMany({
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { vendors: { where: approved } } } },
    }),
    prisma.vendor.count({ where: approved }),
    prisma.vendor.count({ where: { ...approved, isVerified: true } }),
  ]);
  return { featured, recent, categories, totalVendors, verifiedVendors };
}

export async function getCategories() {
  return prisma.vendorCategory.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { vendors: { where: { status: "APPROVED" } } } } },
  });
}

export async function getVendorBySlug(slug: string) {
  return prisma.vendor.findUnique({
    where: { slug },
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
    },
  });
}

/** A URL slug for a business name that no other vendor is using (appends -2, -3… on collision). */
export async function uniqueVendorSlug(name: string, excludeId?: string): Promise<string> {
  const base = slugify(name) || "business";
  for (let i = 1; i < 50; i++) {
    const candidate = i === 1 ? base : `${base}-${i}`;
    const clash = await prisma.vendor.findUnique({ where: { slug: candidate }, select: { id: true } });
    if (!clash || clash.id === excludeId) return candidate;
  }
  return `${base}-${Date.now().toString(36)}`;
}

const STAT_DAYS = 30;

/** Last-30-days totals per stat type plus a per-day VIEW series (UTC days, zero-filled) for one vendor. */
export async function getVendorStats(vendorId: string) {
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - (STAT_DAYS - 1));
  since.setUTCHours(0, 0, 0, 0);

  const rows = await prisma.vendorStatDaily.findMany({ where: { vendorId, date: { gte: since } } });
  const totals: Partial<Record<(typeof rows)[number]["type"], number>> = {};
  const perDay = new Map<string, number>();
  for (const r of rows) {
    totals[r.type] = (totals[r.type] ?? 0) + r.count;
    if (r.type === "VIEW") perDay.set(r.date.toISOString().slice(0, 10), r.count);
  }
  const days = Array.from({ length: STAT_DAYS }, (_, i) => {
    const d = new Date(since);
    d.setUTCDate(since.getUTCDate() + i);
    const key = d.toISOString().slice(0, 10);
    return { date: key, count: perDay.get(key) ?? 0 };
  });
  return { totals, days, windowDays: STAT_DAYS };
}
