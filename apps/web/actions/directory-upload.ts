"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@nb-church/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { requireDirectoryUser } from "@/lib/directory-session";
import { processAndUploadImage, type UploadResult } from "@/lib/image-upload";
import { MAX_PORTFOLIO_IMAGES } from "@/lib/directory";
import type { ActionResult } from "@/lib/action-result";

const OWNER_CATEGORIES = new Set(["vendor-logos", "vendor-covers"]);

/** Logo / cover upload for the listing form: returns a URL the form then saves with the rest of the listing. */
export async function uploadVendorImageAction(category: string, formData: FormData): Promise<UploadResult> {
  const user = await requireDirectoryUser();
  if (!OWNER_CATEGORIES.has(category)) return { ok: false, error: "Unknown upload category." };
  const rl = await checkRateLimit(`dir-upload:${user.id}`, { limit: 30, windowSeconds: 3600 });
  if (!rl.allowed) return { ok: false, error: "Too many uploads. Please wait a while and try again." };
  return processAndUploadImage(category as "vendor-logos" | "vendor-covers", formData.get("file"));
}

/** Adds a photo to the owner's portfolio (max 12). */
export async function addPortfolioImageAction(formData: FormData): Promise<ActionResult> {
  const user = await requireDirectoryUser();
  const rl = await checkRateLimit(`dir-upload:${user.id}`, { limit: 30, windowSeconds: 3600 });
  if (!rl.allowed) return { ok: false, error: "Too many uploads. Please wait a while and try again." };

  const vendor = await prisma.vendor.findFirst({ where: { ownerId: user.id }, include: { _count: { select: { images: true } } } });
  if (!vendor) return { ok: false, error: "Create your listing first." };
  if (vendor._count.images >= MAX_PORTFOLIO_IMAGES) {
    return { ok: false, error: `You can add up to ${MAX_PORTFOLIO_IMAGES} photos. Remove one to add another.` };
  }

  const result = await processAndUploadImage("vendor-portfolio", formData.get("file"));
  if (!result.ok) return { ok: false, error: result.error };

  const caption = String(formData.get("caption") ?? "").trim().slice(0, 120) || null;
  await prisma.vendorImage.create({
    data: { vendorId: vendor.id, url: result.url, caption, sortOrder: vendor._count.images },
  });
  revalidatePath(`/directory/${vendor.slug}`);
  revalidatePath("/directory/dashboard/portfolio");
  return { ok: true, message: "Photo added." };
}

export async function deletePortfolioImageAction(imageId: string): Promise<void> {
  const user = await requireDirectoryUser();
  const image = await prisma.vendorImage.findUnique({ where: { id: imageId }, include: { vendor: { select: { ownerId: true, slug: true } } } });
  if (!image || image.vendor.ownerId !== user.id) return;
  await prisma.vendorImage.delete({ where: { id: imageId } });
  revalidatePath(`/directory/${image.vendor.slug}`);
  revalidatePath("/directory/dashboard/portfolio");
}
