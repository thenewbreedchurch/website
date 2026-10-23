"use server";

import { requireAdmin } from "@/lib/require-admin";
import { checkRateLimit } from "@/lib/rate-limit";
import { isUploadCategory, processAndUploadImage } from "@/lib/image-upload";

export type UploadResult = { ok: true; url: string } | { ok: false; error: string };

/**
 * Processes and uploads an admin-submitted image to R2, returning its public
 * URL. Deliberately decoupled from every record's own create/update action —
 * this only ever returns a URL string for the calling form to drop into its
 * existing image-path field. The shared pipeline lives in lib/image-upload.ts
 * (also used by the vendor directory's owner uploads).
 */
export async function uploadImageAction(category: string, formData: FormData): Promise<UploadResult> {
  const user = await requireAdmin();

  if (!isUploadCategory(category)) {
    return { ok: false, error: "Unknown upload category." };
  }

  const rateLimit = await checkRateLimit(`upload:${user.id}`, { limit: 30, windowSeconds: 600 });
  if (!rateLimit.allowed) {
    return { ok: false, error: "Too many uploads. Please wait a few minutes and try again." };
  }

  return processAndUploadImage(category, formData.get("file"));
}
