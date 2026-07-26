import { z } from "zod";

// zod schemas for every public mutation. Replaces the legacy pattern of bare
// truthy checks (`if (!to) return res.status(400)...`) with real validation —
// see _legacy-static-site/server/routes/subscribe.js for the anti-pattern.

export const subscribeSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  name: z.string().trim().min(1).max(120).optional(),
});
export type SubscribeInput = z.infer<typeof subscribeSchema>;

export const contactCategorySchema = z.enum([
  "GENERAL",
  "PRAYER",
  "MEMBERSHIP",
  "WELFARE",
  "TESTIMONY",
]);

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(120),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  phone: z.string().trim().min(7).max(30).optional().or(z.literal("").transform(() => undefined)),
  category: contactCategorySchema.default("GENERAL"),
  subject: z.string().trim().min(3, "Subject is too short").max(150),
  message: z.string().trim().min(10, "Message is too short").max(500),
});
export type ContactInput = z.infer<typeof contactSchema>;

export const newConvertInterestSchema = z.enum([
  "BAPTISM",
  "BIBLE_STUDY",
  "MEET_LEADER",
  "SERVING",
  "OTHER",
]);

export const newConvertInquirySchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(120),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  phone: z.string().trim().min(7).max(30).optional().or(z.literal("").transform(() => undefined)),
  interests: z.array(newConvertInterestSchema).min(1, "Pick at least one option"),
  message: z.string().trim().max(500).optional().or(z.literal("").transform(() => undefined)),
});
export type NewConvertInquiryInput = z.infer<typeof newConvertInquirySchema>;

export const eventRegistrationSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(120),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  phone: z.string().trim().min(7).max(30).optional().or(z.literal("").transform(() => undefined)),
  guestsCount: z.coerce.number().int().min(1).max(50).default(1),
  notes: z.string().trim().max(1000).optional().or(z.literal("").transform(() => undefined)),
});
export type EventRegistrationInput = z.infer<typeof eventRegistrationSchema>;
