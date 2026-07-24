import { z } from "zod";

// Mirrors the style of lib/validation.ts (the public-form schemas) — one
// schema per admin-mutable entity, inferred types exported alongside.

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
  mapEmbedUrl: z.string().trim().url().optional().or(z.literal("").transform(() => undefined)),
  facebookUrl: z.string().trim().url().optional().or(z.literal("").transform(() => undefined)),
  instagramUrl: z.string().trim().url().optional().or(z.literal("").transform(() => undefined)),
  youtubeUrl: z.string().trim().url().optional().or(z.literal("").transform(() => undefined)),
  tiktokUrl: z.string().trim().url().optional().or(z.literal("").transform(() => undefined)),
  livestreamUrl: z.string().trim().url().optional().or(z.literal("").transform(() => undefined)),
  memberRegistrationUrl: z
    .string()
    .trim()
    .url()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  onlineMeetingUrl: z
    .string()
    .trim()
    .url()
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export const serviceTimeSchema = z.object({
  dayOfWeek: z.enum(["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]),
  label: z.string().trim().min(1).max(120),
  startTime: z.string().trim().regex(/^\d{2}:\d{2}$/, "Use HH:MM"),
  endTime: z
    .string()
    .trim()
    .regex(/^\d{2}:\d{2}$/, "Use HH:MM")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  isOnline: z.coerce.boolean().default(false),
  onlineUrl: z.string().trim().url().optional().or(z.literal("").transform(() => undefined)),
  location: z.string().trim().max(200).optional().or(z.literal("").transform(() => undefined)),
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
  endDateTime: z.string().trim().optional().or(z.literal("").transform(() => undefined)),
  recurrenceRule: z.string().trim().max(200).optional().or(z.literal("").transform(() => undefined)),
  location: z.string().trim().max(300).optional().or(z.literal("").transform(() => undefined)),
  isOnline: z.coerce.boolean().default(false),
  onlineUrl: z.string().trim().url().optional().or(z.literal("").transform(() => undefined)),
  heroImageUrl: z.string().trim().max(500).optional().or(z.literal("").transform(() => undefined)),
  registrationRequired: z.coerce.boolean().default(false),
  registrationDeadline: z.string().trim().optional().or(z.literal("").transform(() => undefined)),
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
  series: z.string().trim().max(150).optional().or(z.literal("").transform(() => undefined)),
  scripture: z.string().trim().max(200).optional().or(z.literal("").transform(() => undefined)),
  description: z.string().trim().max(4000).optional().or(z.literal("").transform(() => undefined)),
  videoUrl: z.string().trim().url(),
  thumbnailUrl: z.string().trim().max(500).optional().or(z.literal("").transform(() => undefined)),
  publishedAt: z.string().trim().min(1, "Published date is required"),
  tags: z.string().trim().optional().or(z.literal("").transform(() => undefined)),
});

export const testimonySchema = z.object({
  authorName: z.string().trim().min(1).max(150),
  authorPhotoUrl: z.string().trim().max(500).optional().or(z.literal("").transform(() => undefined)),
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
  swiftCode: z.string().trim().max(30).optional().or(z.literal("").transform(() => undefined)),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.coerce.boolean().default(true),
});

export const nextStepSchema = z.object({
  page: z.enum(["FIRST_TIMER", "NEW_CONVERT"]),
  title: z.string().trim().min(1).max(150),
  body: z.string().trim().min(1).max(2000),
  imageUrl: z.string().trim().max(500).optional().or(z.literal("").transform(() => undefined)),
  ctaLabel: z.string().trim().max(100).optional().or(z.literal("").transform(() => undefined)),
  ctaUrl: z.string().trim().max(500).optional().or(z.literal("").transform(() => undefined)),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.coerce.boolean().default(true),
});

export const staffMemberSchema = z.object({
  name: z.string().trim().min(1).max(150),
  role: z.string().trim().min(1).max(150),
  department: z.string().trim().max(150).optional().or(z.literal("").transform(() => undefined)),
  email: z
    .string()
    .trim()
    .email("Enter a valid email address")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  phone: z.string().trim().max(50).optional().or(z.literal("").transform(() => undefined)),
  photoUrl: z.string().trim().max(500).optional().or(z.literal("").transform(() => undefined)),
  bio: z.string().trim().max(2000).optional().or(z.literal("").transform(() => undefined)),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.coerce.boolean().default(true),
});
