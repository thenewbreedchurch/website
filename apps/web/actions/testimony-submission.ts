"use server";

import { prisma } from "@nb-church/db";
import { testimonySubmissionSchema } from "@/lib/validation";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { sendTestimonySubmissionEmail } from "@/lib/email";
import type { ActionResult } from "@/lib/action-result";

// Saved as an UNAPPROVED Testimony: it shows up in the admin Testimonies list
// (and the dashboard "awaiting approval" count) but nothing is public until an
// admin approves it.
export async function testimonySubmissionAction(input: unknown): Promise<ActionResult> {
  const ip = await getClientIp();
  const rateLimit = await checkRateLimit(`testimony:${ip}`, { limit: 3, windowSeconds: 600 });
  if (!rateLimit.allowed) {
    return { ok: false, error: "Too many attempts. Please try again in a few minutes." };
  }

  const parsed = testimonySubmissionSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please check the form for errors.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const { name, email, body } = parsed.data;

  const created = await prisma.testimony.create({
    data: { authorName: name, authorEmail: email, body, isApproved: false },
    select: { id: true },
  });

  void sendTestimonySubmissionEmail({ id: created.id, name, email, body });

  return { ok: true, message: "Thank you for sharing! Our team will read it, and may publish it on the site." };
}
