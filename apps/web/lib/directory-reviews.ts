import "server-only";
import { prisma } from "@nb-church/db";

/** Recomputes a vendor's cached rating from its PUBLISHED reviews. Call after any review create/edit/hide. */
export async function recomputeVendorRating(vendorId: string): Promise<void> {
  const agg = await prisma.vendorReview.aggregate({
    where: { vendorId, status: "PUBLISHED" },
    _avg: { rating: true },
    _count: { rating: true },
  });
  await prisma.vendor.update({
    where: { id: vendorId },
    data: { ratingAvg: agg._avg.rating ?? 0, ratingCount: agg._count.rating },
  });
}
