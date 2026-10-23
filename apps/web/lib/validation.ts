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

// ---------------------------------------------------------------------------
// Welfare form (Contact page, "Welfare / Member Care" category). Field set and
// conditional rules mirror the welfare team's own intake form.
// ---------------------------------------------------------------------------

const yesNo = z.enum(["yes", "no"], { message: "Please choose an option" }).transform((v) => v === "yes");
const optionalText = (max: number) =>
  z.string().trim().max(max).optional().or(z.literal("").transform(() => undefined));
const requiredText = (label: string, max: number) =>
  z.string().trim().min(1, `${label} is required`).max(max, `${label} is too long`);

const supportTypeSchema = z.enum(
  ["EMPLOYMENT", "SCHOOL_FEES", "FOOD", "FINANCIAL", "MEDICAL", "RENT", "OTHER"],
  { message: "Please choose an option" }
);

export const welfareRequestSchema = z
  .object({
    email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
    fullName: z.string().trim().min(2, "Full name is too short").max(120),
    occupation: requiredText("Occupation", 120),
    gender: z.enum(["MALE", "FEMALE"], { message: "Please choose an option" }),
    age: z.coerce.number({ message: "Enter your age" }).int("Enter a whole number").min(14, "Enter a valid age").max(110, "Enter a valid age"),
    phone: z.string().trim().min(7, "Enter a valid phone number").max(30),
    address: requiredText("Address", 300),
    membershipStatus: z.enum(["REGISTERED", "UNREGISTERED"], { message: "Please choose an option" }),
    membershipDuration: z.enum(
      ["LT_1_MONTH", "LT_1_YEAR", "LT_3_YEARS", "THREE_YEARS", "GT_3_YEARS"],
      { message: "Please choose an option" }
    ),
    fellowshipGroup: requiredText("Fellowship group", 120),
    isWorker: yesNo,
    department: optionalText(120),
    supportType: supportTypeSchema,
    supportOther: optionalText(120),
    description: requiredText("Description", 2000),
    specificRequest: requiredText("Specific request", 300),
    firstTimeSupport: yesNo,
    lastAssistanceDate: optionalText(10),
    lastAssistanceType: supportTypeSchema.optional().or(z.literal("").transform(() => undefined)),
    lastAssistanceOther: optionalText(120),
    triedElsewhere: requiredText("This", 1000),
    hasDependents: yesNo,
    dependentsCount: z.coerce.number().int().min(1).max(30).optional().or(z.literal("").transform(() => undefined)),
    dependentsAges: optionalText(200),
    homeVisitOk: yesNo,
  })
  .superRefine((v, ctx) => {
    const need = (ok: unknown, path: string, message: string) => {
      if (!ok) ctx.addIssue({ code: "custom", path: [path], message });
    };
    // The form itself says: "failure to answer this nullifies your answer if you selected yes".
    if (v.isWorker) need(v.department, "department", "Tell us which department you serve with");
    if (v.supportType === "OTHER") need(v.supportOther, "supportOther", "Please describe the support you need");
    if (!v.firstTimeSupport) {
      need(v.lastAssistanceDate, "lastAssistanceDate", "Enter the date of your last assistance");
      need(v.lastAssistanceType, "lastAssistanceType", "Tell us what the last assistance was for");
      if (v.lastAssistanceType === "OTHER") {
        need(v.lastAssistanceOther, "lastAssistanceOther", "Please describe the last assistance");
      }
      if (v.lastAssistanceDate && Number.isNaN(Date.parse(v.lastAssistanceDate))) {
        ctx.addIssue({ code: "custom", path: ["lastAssistanceDate"], message: "Enter a valid date" });
      }
    }
    if (v.hasDependents) {
      need(v.dependentsCount, "dependentsCount", "How many dependents do you have?");
      need(v.dependentsAges, "dependentsAges", "Tell us how old they are");
    }
  });
export type WelfareRequestInput = z.infer<typeof welfareRequestSchema>;

// ---------------------------------------------------------------------------
// Vendor directory
// ---------------------------------------------------------------------------

const checkbox = z.preprocess((v) => v === "on" || v === "true" || v === true, z.boolean());
const optText = (max: number) => z.string().trim().max(max).optional().or(z.literal("").transform(() => undefined));

/** Free-text list ("a; b, c" or one per line) → trimmed, de-duplicated array. */
const listText = z
  .string()
  .max(800)
  .optional()
  .transform((v) =>
    Array.from(
      new Set(
        (v ?? "")
          .split(/[\n;,]+/)
          .map((s) => s.trim())
          .filter(Boolean)
          .map((s) => s.slice(0, 60))
      )
    ).slice(0, 20)
  );

export const vendorFormSchema = z
  .object({
    businessName: z.string().trim().min(2, "Business name is too short").max(120),
    categoryId: z.string().min(1, "Choose a category"),
    subcategory: optText(80),
    description: z.string().trim().min(20, "Tell customers a bit more (at least 20 characters)").max(1500),
    services: listText,
    location: z.string().trim().min(2, "Where are you based?").max(120),
    serviceAreas: optText(200),
    yearStarted: z.coerce
      .number()
      .int("Enter a year")
      .min(1950, "Enter a valid year")
      .max(new Date().getFullYear(), "Enter a valid year")
      .optional()
      .or(z.literal("").transform(() => undefined)),
    isRegistered: checkbox,
    registrationNumber: optText(60),
    phone: optText(30),
    whatsapp: optText(30),
    email: z.string().trim().email("Enter a valid email address").max(160).optional().or(z.literal("").transform(() => undefined)),
    website: optText(200),
    instagram: optText(200),
    facebook: optText(200),
    linkedin: optText(200),
    tiktok: optText(200),
    businessHours: optText(120),
    priceRange: optText(80),
    logoUrl: optText(500),
    coverUrl: optText(500),
  })
  .superRefine((v, ctx) => {
    if (!v.phone && !v.whatsapp && !v.email) {
      ctx.addIssue({ code: "custom", path: ["phone"], message: "Add at least one way to contact you (phone, WhatsApp or email)" });
    }
  });
export type VendorFormInput = z.infer<typeof vendorFormSchema>;

// Admin-only extras on top of the vendor form.
export const adminVendorSchema = vendorFormSchema.safeExtend({
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "SUSPENDED"]),
  isVerified: checkbox,
  isFeatured: checkbox,
  adminNotes: optText(1000),
  ownerEmail: z.string().trim().email("Enter a valid email address").optional().or(z.literal("").transform(() => undefined)),
});

export const vendorCategorySchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(80),
  sortOrder: z.coerce.number().int().min(0).max(999).default(0),
  subcategories: listText,
});

export const vendorReportSchema = z.object({
  vendorId: z.string().min(1),
  reason: z.enum(["SCAM", "INAPPROPRIATE", "WRONG_INFO", "CLOSED", "OTHER"], { message: "Choose a reason" }),
  details: optText(600),
  reporterEmail: z.string().trim().email("Enter a valid email address").optional().or(z.literal("").transform(() => undefined)),
});

export const vendorReviewSchema = z.object({
  vendorId: z.string().min(1),
  rating: z.coerce.number().int("Choose a rating").min(1, "Choose a rating").max(5, "Choose a rating"),
  body: z.string().trim().min(10, "Tell us a bit more (at least 10 characters)").max(800),
});

export const directorySignUpSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(120),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address").max(160),
  password: z.string().min(1, "Password is required").max(200),
});

export const directorySignInSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});
