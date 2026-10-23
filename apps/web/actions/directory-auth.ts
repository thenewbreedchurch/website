"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { prisma } from "@nb-church/db";
import { hashPassword, verifyPassword, isPasswordStrong } from "@/lib/password";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { directorySignInSchema, directorySignUpSchema } from "@/lib/validation";
import {
  createDirectorySession,
  destroyAllDirectorySessions,
  destroyDirectorySession,
  getDirectoryUser,
} from "@/lib/directory-session";
import {
  consumeDirectoryResetToken,
  consumeDirectoryVerificationToken,
  createDirectoryResetToken,
  createDirectoryVerificationToken,
} from "@/lib/directory-tokens";
import { sendDirectoryResetEmail, sendDirectoryVerificationEmail } from "@/lib/directory-email";
import type { ActionResult } from "@/lib/action-result";

const GENERIC_SIGN_IN_ERROR = "Invalid email or password.";
const LOCKOUT_THRESHOLD = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

// Same timing-attack mitigation as the admin login: unknown emails pay for an
// argon2 verify too, so latency doesn't reveal whether an account exists.
let dummyHash: Promise<string> | null = null;
const getDummyHash = () => (dummyHash ??= hashPassword("timing-attack-mitigation-dummy-0000"));

/** Only ever redirect back into the directory (never to an arbitrary URL). */
function safeNext(next: unknown): string {
  return typeof next === "string" && /^\/directory(\/|$)/.test(next) && !next.startsWith("//") ? next : "/directory/dashboard";
}

export async function signUpAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const ip = await getClientIp();
  const rl = await checkRateLimit(`dir-signup:${ip}`, { limit: 5, windowSeconds: 3600 });
  if (!rl.allowed) return { ok: false, error: "Too many attempts. Please try again later." };

  const parsed = directorySignUpSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, error: "Please check the form for errors.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const { name, password } = parsed.data;
  const email = parsed.data.email.toLowerCase();

  const strength = isPasswordStrong(password);
  if (!strength.ok) {
    return { ok: false, error: "Please check the form for errors.", fieldErrors: { password: [strength.reason ?? "Choose a stronger password."] } };
  }

  const existing = await prisma.directoryUser.findUnique({ where: { email } });
  if (existing) {
    // Don't reveal that the email is taken: tell everyone the same thing, and
    // quietly send the existing owner something useful instead.
    if (!existing.emailVerifiedAt) {
      void sendDirectoryVerificationEmail(existing.email, existing.name, await createDirectoryVerificationToken(existing.id));
    } else {
      void sendDirectoryResetEmail(existing.email, existing.name, await createDirectoryResetToken(existing.id));
    }
  } else {
    const user = await prisma.directoryUser.create({ data: { name, email, passwordHash: await hashPassword(password) } });
    void sendDirectoryVerificationEmail(user.email, user.name, await createDirectoryVerificationToken(user.id));
  }

  return {
    ok: true,
    message: "Almost there — check your email for a link to confirm your address, then sign in.",
  };
}

export async function signInAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const ip = await getClientIp();
  // Below LOCKOUT_THRESHOLD on purpose, so one IP can't trip account lockouts.
  const rl = await checkRateLimit(`dir-signin:${ip}`, { limit: 4, windowSeconds: 300 });
  if (!rl.allowed) return { ok: false, error: "Too many sign-in attempts. Please wait a few minutes and try again." };

  const parsed = directorySignInSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: GENERIC_SIGN_IN_ERROR };
  const email = parsed.data.email.toLowerCase();

  const user = await prisma.directoryUser.findUnique({ where: { email } });
  if (!user) {
    await verifyPassword(await getDummyHash(), parsed.data.password);
    return { ok: false, error: GENERIC_SIGN_IN_ERROR };
  }
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return { ok: false, error: "This account is temporarily locked after repeated failed attempts. Try again later or reset your password." };
  }

  if (!(await verifyPassword(user.passwordHash, parsed.data.password))) {
    const updated = await prisma.directoryUser.update({ where: { id: user.id }, data: { failedLoginAttempts: { increment: 1 } } });
    if (updated.failedLoginAttempts >= LOCKOUT_THRESHOLD) {
      await prisma.directoryUser.update({
        where: { id: user.id },
        data: { lockedUntil: new Date(Date.now() + LOCKOUT_MS), failedLoginAttempts: 0 },
      });
    }
    return { ok: false, error: GENERIC_SIGN_IN_ERROR };
  }

  await prisma.directoryUser.update({ where: { id: user.id }, data: { failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() } });
  await createDirectorySession(user.id);
  redirect(safeNext(formData.get("next")));
}

export async function signOutAction(): Promise<void> {
  await destroyDirectorySession();
  redirect("/directory");
}

export async function requestResetAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const GENERIC = "If that account exists, we've emailed instructions to reset the password.";
  const ip = await getClientIp();
  const rl = await checkRateLimit(`dir-forgot:${ip}`, { limit: 4, windowSeconds: 900 });
  if (!rl.allowed) return { ok: false, error: "Too many requests. Please wait a while and try again." };

  const email = z.string().trim().toLowerCase().email().safeParse(formData.get("email"));
  if (!email.success) return { ok: true, message: GENERIC };

  try {
    const user = await prisma.directoryUser.findUnique({ where: { email: email.data } });
    if (user) void sendDirectoryResetEmail(user.email, user.name, await createDirectoryResetToken(user.id));
  } catch (err) {
    console.error("[directory-auth] requestResetAction failed:", err instanceof Error ? err.message : err);
  }
  return { ok: true, message: GENERIC };
}

export async function resetPasswordAction(token: string, _prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const ip = await getClientIp();
  const rl = await checkRateLimit(`dir-reset:${ip}`, { limit: 10, windowSeconds: 300 });
  if (!rl.allowed) return { ok: false, error: "Too many attempts. Please wait a few minutes and try again." };

  const password = String(formData.get("password") ?? "");
  const strength = isPasswordStrong(password);
  if (!strength.ok) return { ok: false, error: "Please check the form for errors.", fieldErrors: { password: [strength.reason ?? "Choose a stronger password."] } };

  const user = await consumeDirectoryResetToken(token);
  if (!user) return { ok: false, error: "This reset link is invalid or has expired." };

  await prisma.directoryUser.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(password), failedLoginAttempts: 0, lockedUntil: null, emailVerifiedAt: user.emailVerifiedAt ?? new Date() },
  });
  // Revoke every existing session (including one held by whoever knew the old password).
  await destroyAllDirectorySessions(user.id);
  return { ok: true, message: "Password updated. You can now sign in." };
}

/** Called from an explicit button click on the emailed link — never as a render side effect (link scanners would burn the token). */
export async function verifyDirectoryEmailAction(token: string): Promise<ActionResult> {
  const ip = await getClientIp();
  const rl = await checkRateLimit(`dir-verify:${ip}`, { limit: 10, windowSeconds: 300 });
  if (!rl.allowed) return { ok: false, error: "Too many attempts. Please wait a few minutes and try again." };

  const user = await consumeDirectoryVerificationToken(token);
  if (!user) return { ok: false, error: "This verification link is invalid or has expired." };
  await prisma.directoryUser.update({ where: { id: user.id }, data: { emailVerifiedAt: new Date() } });
  return { ok: true, message: "Your email address has been verified." };
}

export async function resendVerificationAction(): Promise<ActionResult> {
  const user = await getDirectoryUser();
  if (!user) return { ok: false, error: "Please sign in first." };
  if (user.emailVerifiedAt) return { ok: true, message: "Your email is already verified." };
  const rl = await checkRateLimit(`dir-resend:${user.id}`, { limit: 3, windowSeconds: 3600 });
  if (!rl.allowed) return { ok: false, error: "Too many requests. Please check your inbox (and spam folder) or try again later." };
  void sendDirectoryVerificationEmail(user.email, user.name, await createDirectoryVerificationToken(user.id));
  return { ok: true, message: "Verification email sent — check your inbox." };
}
