"use server";

import { prisma } from "@nb-church/db";
import { eventRegistrationSchema } from "@/lib/validation";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { sendEventRegistrationConfirmation } from "@/lib/email";
import { getChurchSettings } from "@/lib/settings";
import type { ActionResult } from "@/lib/action-result";

const eventDateFormatter = new Intl.DateTimeFormat("en-NG", {
  timeZone: "Africa/Lagos",
  dateStyle: "full",
  timeStyle: "short",
});

// Duck-typed check rather than `err instanceof Prisma.PrismaClientKnownRequestError`:
// the generated Prisma client is re-exported from @nb-church/db via `export *`
// on a CommonJS module, and Turbopack's CJS/ESM interop for that pattern does
// not reliably preserve class identity across module instances — instanceof
// silently failed to match in testing even though `err.code` was `'P2002'`.
// Prisma's known-request errors always carry a string `code`, so this is a
// safe and bundler-agnostic way to detect the unique-constraint violation.
function isUniqueConstraintViolation(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: unknown }).code === "P2002"
  );
}

// Rewritten as a Server Action using the real destructured fields — fixes
// the legacy `event-confirmation.js` bug where the Firestore write
// referenced an undefined `formValues` variable and threw on every single
// submission (see _legacy-static-site/server/routes/event-confirmation.js).
// The DB write is the source of truth; email failure never blocks it.
export async function registerForEventAction(
  announcementId: string,
  input: unknown
): Promise<ActionResult> {
  const ip = await getClientIp();
  const rateLimit = await checkRateLimit(`register:${ip}`, { limit: 10, windowSeconds: 600 });
  if (!rateLimit.allowed) {
    return { ok: false, error: "Too many attempts. Please try again in a few minutes." };
  }

  const parsed = eventRegistrationSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please check the form for errors.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const { name, email, phone, guestsCount, notes } = parsed.data;

  const announcement = await prisma.announcement.findUnique({
    where: { id: announcementId },
    select: {
      id: true,
      title: true,
      startDateTime: true,
      location: true,
      isOnline: true,
      onlineUrl: true,
      status: true,
    },
  });

  if (!announcement || announcement.status !== "PUBLISHED") {
    return { ok: false, error: "This event is not available for registration." };
  }

  let registration;
  try {
    registration = await prisma.eventRegistration.create({
      data: { announcementId, name, email, phone, guestsCount, notes },
    });
  } catch (err) {
    if (isUniqueConstraintViolation(err)) {
      return { ok: true, message: "You're already registered for this event — see you there!" };
    }
    throw err;
  }

  const settings = await getChurchSettings();
  void sendEventRegistrationConfirmation({
    to: registration.email,
    name: registration.name,
    orgName: settings.orgName,
    eventTitle: announcement.title,
    eventDateTime: eventDateFormatter.format(announcement.startDateTime),
    location: announcement.isOnline ? undefined : (announcement.location ?? undefined),
    onlineUrl: announcement.isOnline ? (announcement.onlineUrl ?? undefined) : undefined,
    guestsCount: registration.guestsCount,
  });

  return { ok: true, message: "You're registered! A confirmation email is on its way." };
}
