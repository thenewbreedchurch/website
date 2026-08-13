import { z } from "zod";
import { RRule } from "rrule";

// Mirrors the style of lib/validation.ts (the public-form schemas) — one
// schema per admin-mutable entity, inferred types exported alongside.

// Treats an empty string as absent, so a field left blank in a form
// becomes SQL NULL — letting public-facing `??` fallback chains (e.g.
// sermon thumbnail -> YouTube-derived thumbnail -> static default) work
// as intended, instead of `??` treating a saved "" as a real, present
// value and never falling through. The previous per-field pattern,
// `schema.optional().or(z.literal("").transform(() => undefined))`,
// looked right but never actually worked: `.optional()` alone already
// accepts "" (it passes the base string schema trivially, since empty
// strings pass .trim()/.max()/etc.), so Zod's union always matched the
// first branch and the `.or(...)` branch was silently unreachable. This
// caused every "optional" field across every admin form to silently save
// as "" instead of null when left blank — confirmed live in production
// against a real sermon whose blank thumbnail never fell back to its
// YouTube thumbnail because of exactly this.
function optionalText<T extends z.ZodString>(schema: T) {
  return schema.optional().transform((v) => (v === "" ? undefined : v));
}

export const churchSettingsSchema = z.object({
  orgName: z.string().trim().min(1).max(200),
  tagline: z.string().trim().min(1).max(300),
  missionStatement: z.string().trim().max(2000),
  visionStatement: z.string().trim().max(2000),
  streetAddress: z.string().trim().min(1).max(300),
  addressLocality: z.string().trim().min(1).max(150),
  addressRegion: z.string().trim().min(1).max(150),
  addressCountry: z.string().trim().min(1).max(150),
  phone: z.string().trim().min(1).max(50),
  email: z.string().trim().email(),
  mapEmbedUrl: optionalText(z.string().trim().url()),
  facebookUrl: optionalText(z.string().trim().url()),
  instagramUrl: optionalText(z.string().trim().url()),
  youtubeUrl: optionalText(z.string().trim().url()),
  tiktokUrl: optionalText(z.string().trim().url()),
  livestreamUrl: optionalText(z.string().trim().url()),
  memberRegistrationUrl: optionalText(z.string().trim().url()),
  onlineMeetingUrl: optionalText(z.string().trim().url()),
});

export const serviceTimeSchema = z.object({
  dayOfWeek: z.enum(["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]),
  label: z.string().trim().min(1).max(120),
  startTime: z.string().trim().regex(/^\d{2}:\d{2}$/, "Use HH:MM"),
  endTime: optionalText(z.string().trim().regex(/^\d{2}:\d{2}$/, "Use HH:MM")),
  isOnline: z.coerce.boolean().default(false),
  onlineUrl: optionalText(z.string().trim().url()),
  location: optionalText(z.string().trim().max(200)),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.coerce.boolean().default(true),
});

export const announcementSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .max(160)
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, hyphens only"),
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(4000),
  category: z.enum(["SERVICE", "OUTREACH", "YOUTH", "SPECIAL", "FUNDRAISER", "OTHER"]),
  startDateTime: z.string().trim().min(1, "Start date/time is required"),
  endDateTime: optionalText(z.string().trim()),
  recurrenceRule: optionalText(z.string().trim().max(200)).refine(
    (value) => {
      if (!value) return true;
      // Mirrors exactly how lib/announcements.ts consumes this value at
      // render time — rejecting an unparseable rule here, before it ever
      // reaches the database, is what stops a bad save from crashing the
      // public homepage/announcement page later.
      try {
        RRule.fromString(`RRULE:${value}`);
        return true;
      } catch {
        return false;
      }
    },
    { message: "Doesn't look like valid RRULE syntax — check the format matches the hint below the field." }
  ),
  location: optionalText(z.string().trim().max(300)),
  isOnline: z.coerce.boolean().default(false),
  onlineUrl: optionalText(z.string().trim().url()),
  heroImageUrl: optionalText(z.string().trim().max(500)),
  registrationRequired: z.coerce.boolean().default(false),
  registrationDeadline: optionalText(z.string().trim()),
  capacity: z
    .union([z.literal(""), z.coerce.number().int().min(1)])
    .optional()
    .transform((v) => (v === "" || v === undefined ? undefined : v)),
  status: z.enum(["DRAFT", "PUBLISHED", "CANCELLED"]),
});

export const sermonSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .max(160)
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, hyphens only"),
  title: z.string().trim().min(1).max(200),
  speaker: z.string().trim().min(1).max(150),
  series: optionalText(z.string().trim().max(150)),
  scripture: optionalText(z.string().trim().max(200)),
  description: optionalText(z.string().trim().max(4000)),
  videoUrl: z.string().trim().url(),
  thumbnailUrl: optionalText(z.string().trim().max(500)),
  publishedAt: z.string().trim().min(1, "Published date is required"),
  tags: optionalText(z.string().trim()),
});

export const testimonySchema = z.object({
  authorName: z.string().trim().min(1).max(150),
  authorPhotoUrl: optionalText(z.string().trim().max(500)),
  body: z.string().trim().min(1).max(4000),
  isFeatured: z.coerce.boolean().default(false),
  isApproved: z.coerce.boolean().default(false),
});

export const givingAccountSchema = z.object({
  fundName: z.string().trim().min(1).max(150),
  currency: z.string().trim().min(1).max(10),
  bankName: z.string().trim().min(1).max(150),
  accountNumber: z.string().trim().min(1).max(50),
  accountName: z.string().trim().min(1).max(200),
  swiftCode: optionalText(z.string().trim().max(30)),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.coerce.boolean().default(true),
});

export const nextStepSchema = z.object({
  page: z.enum(["FIRST_TIMER", "NEW_CONVERT"]),
  title: z.string().trim().min(1).max(150),
  body: z.string().trim().min(1).max(2000),
  imageUrl: optionalText(z.string().trim().max(500)),
  ctaLabel: optionalText(z.string().trim().max(100)),
  ctaUrl: optionalText(z.string().trim().max(500)),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.coerce.boolean().default(true),
});

export const staffMemberSchema = z.object({
  name: z.string().trim().min(1).max(150),
  role: z.string().trim().min(1).max(150),
  department: optionalText(z.string().trim().max(150)),
  email: optionalText(z.string().trim().email("Enter a valid email address")),
  phone: optionalText(z.string().trim().max(50)),
  photoUrl: optionalText(z.string().trim().max(500)),
  bio: optionalText(z.string().trim().max(2000)),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.coerce.boolean().default(true),
});
