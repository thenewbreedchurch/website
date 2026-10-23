"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@nb-church/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { vendorFormSchema } from "@/lib/validation";
import { requireDirectoryUser } from "@/lib/directory-session";
import { uniqueVendorSlug } from "@/lib/directory-queries";
import { sendDirectoryAdminNotice } from "@/lib/directory-email";
import type { ActionResult } from "@/lib/action-result";

function revalidateDirectory(slug?: string) {
  revalidatePath("/marketplace");
  revalidatePath("/marketplace/browse");
  revalidatePath("/marketplace/dashboard", "layout");
  if (slug) revalidatePath(`/marketplace/${slug}`);
}

/** Creates the signed-in user's listing (as PENDING) or updates the one they own. */
export async function saveOwnListingAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const user = await requireDirectoryUser("/marketplace/dashboard/listing");
  if (!user.emailVerifiedAt) {
    return { ok: false, error: "Please verify your email address first — we sent you a link when you signed up." };
  }
  const rl = await checkRateLimit(`dir-listing:${user.id}`, { limit: 20, windowSeconds: 3600 });
  if (!rl.allowed) return { ok: false, error: "Too many saves. Please wait a while and try again." };

  const parsed = vendorFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, error: "Please check the form for errors.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const v = parsed.data;
  const category = await prisma.vendorCategory.findUnique({ where: { id: v.categoryId }, select: { id: true } });
  if (!category) return { ok: false, error: "Please check the form for errors.", fieldErrors: { categoryId: ["Choose a category"] } };

  const data = {
    businessName: v.businessName,
    categoryId: v.categoryId,
    subcategory: v.subcategory ?? null,
    description: v.description,
    services: v.services,
    location: v.location,
    serviceAreas: v.serviceAreas ?? null,
    yearStarted: v.yearStarted ?? null,
    isRegistered: v.isRegistered,
    registrationNumber: v.registrationNumber ?? null,
    phone: v.phone ?? null,
    whatsapp: v.whatsapp ?? null,
    email: v.email?.toLowerCase() ?? null,
    website: v.website ?? null,
    instagram: v.instagram ?? null,
    facebook: v.facebook ?? null,
    linkedin: v.linkedin ?? null,
    tiktok: v.tiktok ?? null,
    businessHours: v.businessHours ?? null,
    priceRange: v.priceRange ?? null,
    logoUrl: v.logoUrl ?? null,
    coverUrl: v.coverUrl ?? null,
  };

  const existing = await prisma.vendor.findFirst({ where: { ownerId: user.id } });

  if (existing) {
    // Changing the name or registration number invalidates a past verification.
    const identityChanged = existing.businessName !== data.businessName || existing.registrationNumber !== data.registrationNumber;
    const updated = await prisma.vendor.update({
      where: { id: existing.id },
      data: {
        ...data,
        ...(identityChanged ? { isVerified: false } : {}),
        // A rejected listing goes back into the review queue once the owner edits it.
        ...(existing.status === "REJECTED" ? { status: "PENDING" as const } : {}),
      },
    });
    if (existing.status === "REJECTED") {
      void sendDirectoryAdminNotice({
        subject: `[Directory] Resubmitted: ${updated.businessName}`,
        title: "A listing was updated and resubmitted",
        body: [`${updated.businessName} was edited after being rejected and is waiting for review.`],
        path: `/admin/marketplace/vendors/${updated.id}`,
      });
    }
    revalidateDirectory(existing.slug);
    return {
      ok: true,
      message:
        existing.status === "REJECTED"
          ? "Saved and resubmitted for review."
          : identityChanged && existing.isVerified
            ? "Saved. Because you changed the business name or registration number, your Verified badge will be re-checked."
            : "Saved.",
    };
  }

  const slug = await uniqueVendorSlug(data.businessName);
  const created = await prisma.vendor.create({ data: { ...data, slug, ownerId: user.id, status: "PENDING" } });
  void sendDirectoryAdminNotice({
    subject: `[Directory] New listing to review: ${created.businessName}`,
    title: "A new business listing is waiting for review",
    body: [`${created.businessName} (${created.location}) was submitted by ${user.name} <${user.email}>.`],
    path: `/admin/marketplace/vendors/${created.id}`,
    replyTo: user.email,
  });
  revalidateDirectory();
  return { ok: true, message: "Thanks! Your listing has been submitted for review. We'll email you when it's live." };
}

/** Attaches an unowned imported listing to the signed-in user when their verified email matches the listing's email. */
export async function claimVendorAction(vendorId: string): Promise<ActionResult> {
  const user = await requireDirectoryUser();
  if (!user.emailVerifiedAt) return { ok: false, error: "Verify your email address first." };
  const rl = await checkRateLimit(`dir-claim:${user.id}`, { limit: 5, windowSeconds: 3600 });
  if (!rl.allowed) return { ok: false, error: "Too many attempts. Please try again later." };

  if (await prisma.vendor.findFirst({ where: { ownerId: user.id }, select: { id: true } })) {
    return { ok: false, error: "Your account already manages a listing." };
  }
  const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
  if (!vendor || vendor.ownerId || vendor.email?.toLowerCase() !== user.email.toLowerCase()) {
    return { ok: false, error: "That listing can't be claimed with this account." };
  }
  // updateMany with ownerId: null makes this race-safe if two claims land at once.
  const res = await prisma.vendor.updateMany({ where: { id: vendorId, ownerId: null }, data: { ownerId: user.id } });
  if (res.count === 0) return { ok: false, error: "That listing was just claimed by someone else." };
  revalidateDirectory(vendor.slug);
  return { ok: true, message: "Listing claimed — it's now yours to manage." };
}
