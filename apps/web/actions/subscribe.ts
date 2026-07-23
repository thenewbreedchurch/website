"use server";

import { prisma } from "@nb-church/db";
import { subscribeSchema } from "@/lib/validation";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { sendNewsletterWelcomeEmail } from "@/lib/email";
import { getChurchSettings } from "@/lib/settings";
import type { ActionResult } from "@/lib/action-result";

// Single subscribe code path — fixes the legacy split between a flat-file
// store and Firestore (two inconsistent subscriber stores for the same
// concept, see HANDOFF.md decision log). One Prisma upsert, one source of
// truth.
export async function subscribeAction(input: unknown): Promise<ActionResult> {
  const ip = await getClientIp();
  const rateLimit = await checkRateLimit(`subscribe:${ip}`, { limit: 5, windowSeconds: 600 });
  if (!rateLimit.allowed) {
    return { ok: false, error: "Too many attempts. Please try again in a few minutes." };
  }

  const parsed = subscribeSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please check the form for errors.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const { email, name } = parsed.data;

  const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });

  let subscriber;
  if (!existing) {
    subscriber = await prisma.newsletterSubscriber.create({
      data: { email, name, status: "ACTIVE", source: "website" },
    });
  } else if (existing.status === "UNSUBSCRIBED") {
    subscriber = await prisma.newsletterSubscriber.update({
      where: { id: existing.id },
      data: {
        status: "ACTIVE",
        name: name ?? existing.name,
        subscribedAt: new Date(),
        unsubscribedAt: null,
      },
    });
  } else {
    return { ok: true, message: "You're already subscribed — thank you!" };
  }

  const settings = await getChurchSettings();
  void sendNewsletterWelcomeEmail({
    to: subscriber.email,
    name: subscriber.name ?? undefined,
    orgName: settings.orgName,
    unsubscribeToken: subscriber.unsubscribeToken,
  });

  return { ok: true, message: "Thanks for subscribing!" };
}
