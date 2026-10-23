
// Rules for documents attached to a welfare request.

export const WELFARE_MAX_FILES = 3;
export const WELFARE_MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB per document
/**
 * Most mail providers reject messages over ~25 MB *after* base64 encoding
 * (which adds a third). 15 MB of raw files stays safely under that, so the
 * email carries documents up to this combined size; anything beyond it is
 * still stored and downloadable from the admin panel, and the email says so.
 */
export const WELFARE_MAX_EMAIL_ATTACH_BYTES = 15 * 1024 * 1024;

export const WELFARE_ALLOWED_LABEL = "PDF, Word, JPG, PNG, WEBP or HEIC";

type Kind = { mime: string; ext: string };

const startsWith = (b: Uint8Array, sig: number[], at = 0) => sig.every((v, i) => b[at + i] === v);

/** Identifies a file by its leading bytes — the browser-supplied type/extension is never trusted. */
export function sniffAttachment(bytes: Uint8Array, claimedName: string): Kind | null {
  if (startsWith(bytes, [0x25, 0x50, 0x44, 0x46])) return { mime: "application/pdf", ext: "pdf" };
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return { mime: "image/jpeg", ext: "jpg" };
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47])) return { mime: "image/png", ext: "png" };
  if (startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) && startsWith(bytes, [0x57, 0x45, 0x42, 0x50], 8)) return { mime: "image/webp", ext: "webp" };
  if (startsWith(bytes, [0x66, 0x74, 0x79, 0x70], 4)) return { mime: "image/heic", ext: "heic" }; // "ftyp" box (HEIC/HEIF)
  if (startsWith(bytes, [0xd0, 0xcf, 0x11, 0xe0])) return { mime: "application/msword", ext: "doc" };
  // .docx is a zip; only accept it when the name says docx so arbitrary zips don't slip through.
  if (startsWith(bytes, [0x50, 0x4b, 0x03, 0x04]) && /\.docx$/i.test(claimedName)) {
    return { mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", ext: "docx" };
  }
  return null;
}

/** Safe display/download name: no paths or control characters, bounded length, extension matches the sniffed type. */
export function safeFilename(claimed: string, ext: string): string {
  const base = claimed
    .replace(/^.*[\\/]/, "")
    .replace(/\.[^.]*$/, "")
    .replace(/[^\p{L}\p{N} ._()-]+/gu, "_")
    .trim()
    .slice(0, 80);
  return `${base || "document"}.${ext}`;
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
