"use server";

import { z } from "zod";
import { prisma } from "@nb-church/db";
import { subscribeSchema } from "@/lib/validation";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { sendNewsletterWelcomeEmail } from "@/lib/email";
import { getChurchSettings } from "@/lib/settings";
import type { ActionResult } from "@/lib/action-result";

const unsubscribeSchema = z.object({
  token: z.string().trim().min(20),
});

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

// Deliberately not consumed as a side effect of rendering /unsubscribe (see
// admin/(auth)/verify/[token]/page.tsx for the same reasoning) — an email
// security scanner or link-prefetcher following the emailed link before the
// subscriber actually clicks it would otherwise silently unsubscribe them.
// Only runs on an explicit button click on that page.
export async function unsubscribeAction(token: string): Promise<ActionResult> {
  const ip = await getClientIp();
  const rateLimit = await checkRateLimit(`unsubscribe:${ip}`, { limit: 10, windowSeconds: 300 });
  if (!rateLimit.allowed) {
    return { ok: false, error: "Too many attempts. Please wait a few minutes and try again." };
  }

  const parsed = unsubscribeSchema.safeParse({ token });
  if (!parsed.success) {
    return { ok: false, error: "This unsubscribe link is invalid." };
  }

  const subscriber = await prisma.newsletterSubscriber.findUnique({
    where: { unsubscribeToken: parsed.data.token },
  });
  if (!subscriber) {
    return { ok: false, error: "This unsubscribe link is invalid or has already been used." };
  }

  if (subscriber.status !== "UNSUBSCRIBED") {
    await prisma.newsletterSubscriber.update({
      where: { id: subscriber.id },
      data: { status: "UNSUBSCRIBED", unsubscribedAt: new Date() },
    });
  }

  return { ok: true };
}
