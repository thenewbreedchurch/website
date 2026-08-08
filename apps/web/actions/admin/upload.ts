"use server";

import sharp from "sharp";
import { requireAdmin } from "@/lib/require-admin";
import { checkRateLimit } from "@/lib/rate-limit";
import { uploadImageToR2, isR2Configured } from "@/lib/r2";

export type UploadResult = { ok: true; url: string } | { ok: false; error: string };

// One category per admin form that has an image field — also the R2 key
// prefix, so objects land in a folder per use, mirroring the existing
// public/images/{section}/ layout from scripts/prepare-images.mjs. Width
// matches that same script's per-section sizing convention: full-bleed-ish
// hero/detail images wider than card thumbnails/avatars.
const CATEGORY_MAX_WIDTH = {
  announcements: 1600,
  sermons: 800,
  staff: 800,
  testimonies: 400,
  "next-steps": 800,
} as const;

type UploadCategory = keyof typeof CATEGORY_MAX_WIDTH;

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
// Raw upload ceiling, before sharp compresses it — generous enough for an
// unedited phone photo. Must stay comfortably under next.config.ts's
// experimental.serverActions.bodySizeLimit (10mb), which bounds the whole
// multipart request including field/boundary overhead, not just this file.
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

function isUploadCategory(value: string): value is UploadCategory {
  return Object.hasOwn(CATEGORY_MAX_WIDTH, value);
}

/**
 * Processes and uploads an admin-submitted image to R2, returning its
 * public URL. Deliberately decoupled from every record's own create/update
 * action (announcements, sermons, staff, testimonies, next-steps) — this
 * only ever returns a URL string for the calling form to drop into its
 * existing image-path field, so none of those actions, their Zod schemas,
 * or the Prisma models needed any changes to support uploads.
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

  if (!isR2Configured()) {
    return {
      ok: false,
      error: "Image upload isn't configured yet — paste an image path or URL directly instead.",
    };
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { ok: false, error: "No file was received." };
  }
  if (file.size === 0) {
    return { ok: false, error: "That file is empty." };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { ok: false, error: "That image is too large — please use a file under 8MB." };
  }
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return {
      ok: false,
      error: "Please upload a JPEG, PNG, or WEBP image. (iPhone users: switch Camera Format to \"Most Compatible\" — HEIC photos aren't supported.)",
    };
  }

  let processed: Buffer;
  try {
    const raw = Buffer.from(await file.arrayBuffer());
    // .rotate() auto-orients from EXIF before .withMetadata() is never
    // called, which is what actually strips EXIF/GPS from the output — same
    // privacy-preserving default as scripts/prepare-images.mjs.
    processed = await sharp(raw)
      .rotate()
      .resize({ width: CATEGORY_MAX_WIDTH[category], withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer();
  } catch {
    return { ok: false, error: "That file doesn't look like a valid image." };
  }

  try {
    const url = await uploadImageToR2({
      category,
      key: `${crypto.randomUUID()}.jpg`,
      body: processed,
      contentType: "image/jpeg",
    });
    return { ok: true, url };
  } catch (err) {
    console.error("[upload] R2 upload failed:", (err as Error).message);
    return { ok: false, error: "Upload failed — please try again." };
  }
}
