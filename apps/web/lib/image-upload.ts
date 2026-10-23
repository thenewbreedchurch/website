import "server-only";
import crypto from "node:crypto";
import sharp from "sharp";
import { uploadImageToR2, isR2Configured } from "@/lib/r2";

export type UploadResult = { ok: true; url: string } | { ok: false; error: string };

// One category per image use — also the R2 key prefix, so objects land in a
// folder per use. Widths: full-bleed-ish hero/cover images wider than card
// thumbnails/avatars.
export const CATEGORY_MAX_WIDTH = {
  announcements: 1600,
  sermons: 800,
  staff: 800,
  testimonies: 400,
  "next-steps": 800,
  "vendor-logos": 600,
  "vendor-covers": 1600,
  "vendor-portfolio": 1400,
} as const;

export type UploadCategory = keyof typeof CATEGORY_MAX_WIDTH;

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
// Raw upload ceiling, before sharp compresses it. Must stay comfortably under
// next.config.ts's experimental.serverActions.bodySizeLimit (10mb).
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export function isUploadCategory(value: string): value is UploadCategory {
  return Object.hasOwn(CATEGORY_MAX_WIDTH, value);
}

/**
 * Validates, resizes (EXIF/GPS stripped) and uploads an image file to R2.
 * Callers are responsible for authorisation and rate limiting.
 */
export async function processAndUploadImage(category: UploadCategory, file: unknown): Promise<UploadResult> {
  if (!isR2Configured()) {
    return {
      ok: false,
      error: "Image upload isn't configured yet — paste an image path or URL directly instead.",
    };
  }
  if (!(file instanceof File)) return { ok: false, error: "No file was received." };
  if (file.size === 0) return { ok: false, error: "That file is empty." };
  if (file.size > MAX_UPLOAD_BYTES) {
    return { ok: false, error: "That image is too large — please use a file under 8MB." };
  }
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return {
      ok: false,
      error:
        'Please upload a JPEG, PNG, or WEBP image. (iPhone users: switch Camera Format to "Most Compatible" — HEIC photos aren\'t supported.)',
    };
  }

  let processed: Buffer;
  try {
    const raw = Buffer.from(await file.arrayBuffer());
    // .rotate() auto-orients from EXIF; .withMetadata() is never called, which
    // is what strips EXIF/GPS from the output.
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
