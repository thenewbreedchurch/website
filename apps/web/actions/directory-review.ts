"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@nb-church/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { vendorReviewSchema, vendorReportSchema } from "@/lib/validation";
import { getDirectoryUser } from "@/lib/directory-session";
import { recomputeVendorRating } from "@/lib/directory-reviews";
import { sendDirectoryAdminNotice } from "@/lib/directory-email";
import { getClientIp } from "@/lib/rate-limit";
import { REPORT_REASON_LABELS } from "@/lib/directory";
import type { ActionResult } from "@/lib/action-result";

/** Creates (or updates) the signed-in user's single review of a business. */
export async function submitReviewAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const user = await getDirectoryUser();
  if (!user) return { ok: false, error: "Please sign in to leave a review." };
  if (!user.emailVerifiedAt) return { ok: false, error: "Please verify your email address before leaving a review." };

  const rl = await checkRateLimit(`dir-review:${user.id}`, { limit: 5, windowSeconds: 3600 });
  if (!rl.allowed) return { ok: false, error: "You're posting too quickly. Please try again later." };

  const parsed = vendorReviewSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, error: "Please check the form for errors.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const { vendorId, rating, body } = parsed.data;

  const vendor = await prisma.vendor.findFirst({ where: { id: vendorId, status: "APPROVED" }, select: { id: true, slug: true, ownerId: true } });
  if (!vendor) return { ok: false, error: "That business isn't available." };
  if (vendor.ownerId === user.id) return { ok: false, error: "You can't review your own business." };

  await prisma.vendorReview.upsert({
    where: { vendorId_userId: { vendorId, userId: user.id } },
    create: { vendorId, userId: user.id, rating, body },
    // Editing a previously hidden review does not un-hide it.
    update: { rating, body },
  });
  await recomputeVendorRating(vendorId);
  revalidatePath(`/marketplace/${vendor.slug}`);
  revalidatePath("/marketplace/browse");
  return { ok: true, message: "Thanks — your review has been posted." };
}

/** Anonymous "report this business" flag, rate-limited per IP, sent to the admin queue. */
export async function reportVendorAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const ip = await getClientIp();
  const rl = await checkRateLimit(`dir-report:${ip}`, { limit: 5, windowSeconds: 3600 });
  if (!rl.allowed) return { ok: false, error: "Too many reports. Please try again later." };

  const parsed = vendorReportSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, error: "Please check the form for errors.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const vendor = await prisma.vendor.findUnique({ where: { id: parsed.data.vendorId }, select: { id: true, businessName: true } });
  if (!vendor) return { ok: false, error: "That business isn't available." };

  await prisma.vendorReport.create({
    data: {
      vendorId: vendor.id,
      reason: parsed.data.reason,
      details: parsed.data.details ?? null,
      reporterEmail: parsed.data.reporterEmail?.toLowerCase() ?? null,
    },
  });
  void sendDirectoryAdminNotice({
    subject: `[Directory] Listing reported: ${vendor.businessName}`,
    title: `${vendor.businessName} was reported`,
    body: [`Reason: ${REPORT_REASON_LABELS[parsed.data.reason]}`, ...(parsed.data.details ? [parsed.data.details] : [])],
    path: "/admin/marketplace/reports",
    replyTo: parsed.data.reporterEmail,
  });
  return { ok: true, message: "Thank you — the team will look into it." };
}
