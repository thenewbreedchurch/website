"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@nb-church/db";
import type { ReportStatus, ReviewStatus } from "@nb-church/db";
import { requireAdmin } from "@/lib/require-admin";
import { recomputeVendorRating } from "@/lib/directory-reviews";

export async function setReviewStatusAction(id: string, status: ReviewStatus): Promise<void> {
  await requireAdmin();
  if (status !== "PUBLISHED" && status !== "HIDDEN") return;
  const review = await prisma.vendorReview.update({ where: { id }, data: { status }, include: { vendor: { select: { slug: true } } } });
  await recomputeVendorRating(review.vendorId);
  revalidatePath("/admin/directory/reviews");
  revalidatePath(`/directory/${review.vendor.slug}`);
}

export async function deleteReviewAction(id: string): Promise<void> {
  await requireAdmin();
  const review = await prisma.vendorReview.delete({ where: { id }, include: { vendor: { select: { slug: true } } } });
  await recomputeVendorRating(review.vendorId);
  revalidatePath("/admin/directory/reviews");
  revalidatePath(`/directory/${review.vendor.slug}`);
}

export async function setReportStatusAction(id: string, status: ReportStatus): Promise<void> {
  await requireAdmin();
  if (!["NEW", "REVIEWED", "ACTIONED"].includes(status)) return;
  await prisma.vendorReport.update({ where: { id }, data: { status } });
  revalidatePath("/admin/directory/reports");
}

export async function deleteReportAction(id: string): Promise<void> {
  await requireAdmin();
  await prisma.vendorReport.delete({ where: { id } });
  revalidatePath("/admin/directory/reports");
}
