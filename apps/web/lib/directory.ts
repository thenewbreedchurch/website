// Small pure helpers shared by the directory pages, forms and importer.

/** Turns "franekfoods.com.ng" or "www.x.com/y" into a safe absolute https URL; rejects other schemes. */
export function externalUrl(raw: string | null | undefined): string | null {
  const v = raw?.trim();
  if (!v) return null;
  const withProtocol = /^[a-z][a-z0-9+.-]*:/i.test(v) ? v : `https://${v.replace(/^\/+/, "")}`;
  try {
    const url = new URL(withProtocol);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

/** Social handle/URL → absolute URL on the given network (accepts "@name", "name" or a full link). */
export function socialUrl(network: "instagram" | "facebook" | "linkedin" | "tiktok", raw: string | null | undefined): string | null {
  const v = raw?.trim();
  if (!v) return null;
  if (/^(https?:\/\/|www\.)/i.test(v) || /\.(com|me|co)\b/i.test(v)) return externalUrl(v);
  const handle = v.replace(/^@/, "");
  const base = {
    instagram: "https://instagram.com/",
    facebook: "https://facebook.com/",
    linkedin: "https://linkedin.com/in/",
    tiktok: "https://tiktok.com/@",
  }[network];
  return `${base}${encodeURIComponent(handle)}`;
}

/** Digits-only international number for wa.me; assumes Nigeria (+234) for local numbers starting with 0. */
export function whatsappNumber(raw: string | null | undefined): string | null {
  let digits = (raw ?? "").replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("0")) digits = `234${digits.slice(1)}`;
  else if (digits.length === 10) digits = `234${digits}`;
  return digits.length >= 11 && digits.length <= 15 ? digits : null;
}

export function telHref(raw: string | null | undefined): string | null {
  const v = raw?.replace(/[^\d+]/g, "");
  return v && v.length >= 7 ? `tel:${v}` : null;
}

export function initialsOf(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "?";
}

export const VENDOR_STAT_LABELS = {
  VIEW: "Profile views",
  CALL: "Calls",
  WHATSAPP: "WhatsApp",
  EMAIL: "Emails",
  WEBSITE: "Website visits",
  SOCIAL: "Social taps",
} as const;

export const REPORT_REASON_LABELS = {
  SCAM: "Looks like a scam",
  INAPPROPRIATE: "Inappropriate content",
  WRONG_INFO: "Wrong or outdated information",
  CLOSED: "Business has closed",
  OTHER: "Something else",
} as const;

export const VENDOR_STATUS_LABELS = {
  PENDING: "Pending review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  SUSPENDED: "Suspended",
} as const;

export const BROWSE_PAGE_SIZE = 12;
export const MAX_PORTFOLIO_IMAGES = 12;

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
