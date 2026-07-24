"use server";

import { prisma } from "@nb-church/db";
import { newConvertInquirySchema } from "@/lib/validation";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { sendNewConvertInquiryEmail } from "@/lib/email";
import type { ActionResult } from "@/lib/action-result";

export async function newConvertInquiryAction(input: unknown): Promise<ActionResult> {
  const ip = await getClientIp();
  const rateLimit = await checkRateLimit(`new-convert-inquiry:${ip}`, {
    limit: 5,
    windowSeconds: 600,
  });
  if (!rateLimit.allowed) {
    return { ok: false, error: "Too many attempts. Please try again in a few minutes." };
  }

  const parsed = newConvertInquirySchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please check the form for errors.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const { name, email, phone, interests, message } = parsed.data;

  await prisma.newConvertInquiry.create({
    data: { name, email, phone, interests, message, status: "NEW" },
  });

  void sendNewConvertInquiryEmail({ name, email, phone, interests, message });

  return {
    ok: true,
    message: "Thank you for reaching out — someone from our team will connect with you soon.",
  };
}
