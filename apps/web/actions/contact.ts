"use server";

import { prisma } from "@nb-church/db";
import { contactSchema } from "@/lib/validation";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { sendContactNotificationEmail } from "@/lib/email";
import type { ActionResult } from "@/lib/action-result";

export async function contactAction(input: unknown): Promise<ActionResult> {
  const ip = await getClientIp();
  const rateLimit = await checkRateLimit(`contact:${ip}`, { limit: 5, windowSeconds: 600 });
  if (!rateLimit.allowed) {
    return { ok: false, error: "Too many attempts. Please try again in a few minutes." };
  }

  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please check the form for errors.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const { name, email, phone, category, subject, message } = parsed.data;

  await prisma.contactMessage.create({
    data: { name, email, phone, category, subject, message, status: "NEW" },
  });

  void sendContactNotificationEmail({ name, email, phone, category, subject, message });

  return { ok: true, message: "Thanks for reaching out — we'll get back to you soon." };
}
