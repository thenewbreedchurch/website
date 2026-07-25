"use server";

import { z } from "zod";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@nb-church/db";
import { hashPassword, verifyPassword, isPasswordStrong } from "@/lib/password";
import {
  createSession,
  destroySession,
  destroyAllSessionsForUser,
  destroyOtherSessionsForUser,
  getSessionFromCookie,
  SESSION_COOKIE_NAME,
} from "@/lib/session";
import {
  createPasswordResetToken,
  createVerificationToken,
  consumePasswordResetToken,
  consumeVerificationToken,
} from "@/lib/admin-tokens";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { sendPasswordResetEmail, sendVerificationEmail, sendAccountLockedEmail } from "@/lib/admin-email";

type ActionResult<T extends object = object> = ({ ok: true } & T) | { ok: false; error: string };

const GENERIC_LOGIN_ERROR = "Invalid email or password.";
const LOCKOUT_THRESHOLD = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

const resetPasswordSchema = z.object({
  token: z.string().trim().min(20),
  newPassword: z.string().min(1),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(1),
});

const verifyEmailSchema = z.object({
  token: z.string().trim().min(20),
});

// Computed once per server process and reused, so the "account not found"
// path pays for an argon2 verify with the same cost profile as a real
// account, closing the timing side-channel that would otherwise let an
// attacker distinguish "no such account" from "wrong password" by latency.
let dummyHashPromise: Promise<string> | null = null;
function getDummyHash(): Promise<string> {
  if (!dummyHashPromise) {
    dummyHashPromise = hashPassword("timing-attack-mitigation-dummy-0000");
  }
  return dummyHashPromise;
}

export async function loginAction(
  email: string,
  password: string
): Promise<ActionResult<{ mustChangePassword: boolean }>> {
  const ip = await getClientIp();
  // Deliberately kept below LOCKOUT_THRESHOLD (5): an attacker confined to
  // one IP can never accumulate 5 failures inside a single window, so this
  // rate limit is what actually gates the ability to trip account lockout
  // at all, not just a generic anti-spam throttle.
  const rl = await checkRateLimit(`admin-login:${ip}`, { limit: 4, windowSeconds: 300 });
  if (!rl.allowed) {
    return { ok: false, error: "Too many login attempts. Please wait a few minutes and try again." };
  }

  const parsed = loginSchema.safeParse({ email, password });
  if (!parsed.success) {
    return { ok: false, error: GENERIC_LOGIN_ERROR };
  }

  const user = await prisma.adminUser.findUnique({ where: { email: parsed.data.email } });

  if (!user) {
    await verifyPassword(await getDummyHash(), parsed.data.password);
    return { ok: false, error: GENERIC_LOGIN_ERROR };
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return {
      ok: false,
      error: "This account is temporarily locked due to repeated failed login attempts. Try again later.",
    };
  }

  const validPassword = await verifyPassword(user.passwordHash, parsed.data.password);

  if (!validPassword) {
    const updated = await prisma.adminUser.update({
      where: { id: user.id },
      data: { failedLoginAttempts: { increment: 1 } },
    });

    if (updated.failedLoginAttempts >= LOCKOUT_THRESHOLD) {
      const lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
      await prisma.adminUser.update({
        where: { id: user.id },
        data: {
          lockedUntil,
          failedLoginAttempts: 0,
        },
      });
      // Visibility for the real admin that an attack (or a lot of their own
      // mistyped passwords) just happened — points at the one recovery path
      // that still works while locked (password reset).
      await sendAccountLockedEmail(user.email, lockedUntil);
    }

    return { ok: false, error: GENERIC_LOGIN_ERROR };
  }

  await prisma.adminUser.update({
    where: { id: user.id },
    data: { failedLoginAttempts: 0, lastLoginAt: new Date() },
  });

  await createSession(user.id);

  return { ok: true, mustChangePassword: user.mustChangePassword };
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/admin/login");
}

// Used by the session-timeout page, which needs to invalidate the session
// server-side and then render its own "you were logged out" message before
// navigating away — logoutAction()'s built-in redirect() would short-circuit
// that, so this variant destroys the session without redirecting.
export async function invalidateSessionAction(): Promise<void> {
  await destroySession();
}

export async function requestPasswordResetAction(
  email: string
): Promise<ActionResult<{ message: string }>> {
  const GENERIC_MESSAGE = "If that account exists, we've sent an email with instructions.";

  const ip = await getClientIp();
  const rl = await checkRateLimit(`admin-forgot-password:${ip}`, { limit: 4, windowSeconds: 900 });
  if (!rl.allowed) {
    return { ok: false, error: "Too many requests. Please wait a while and try again." };
  }

  const parsed = forgotPasswordSchema.safeParse({ email });
  if (!parsed.success) {
    // Still generic — an invalid email format is the only case worth
    // rejecting outright, but we keep the same wording so a client can't
    // distinguish "bad format" from "no such account" server behavior.
    return { ok: true, message: GENERIC_MESSAGE };
  }

  try {
    const user = await prisma.adminUser.findUnique({ where: { email: parsed.data.email } });
    if (user) {
      const token = await createPasswordResetToken(user.id);
      await sendPasswordResetEmail(user.email, token);
    }
  } catch (err) {
    console.error(
      "[admin-auth] requestPasswordResetAction failed:",
      err instanceof Error ? err.message : err
    );
  }

  return { ok: true, message: GENERIC_MESSAGE };
}

export async function resetPasswordAction(
  token: string,
  newPassword: string
): Promise<ActionResult> {
  const ip = await getClientIp();
  const rl = await checkRateLimit(`admin-reset-password:${ip}`, { limit: 10, windowSeconds: 300 });
  if (!rl.allowed) {
    return { ok: false, error: "Too many attempts. Please wait a few minutes and try again." };
  }

  const parsed = resetPasswordSchema.safeParse({ token, newPassword });
  if (!parsed.success) {
    return { ok: false, error: "Invalid request." };
  }

  const strength = isPasswordStrong(parsed.data.newPassword);
  if (!strength.ok) {
    return { ok: false, error: strength.reason ?? "Password is not strong enough." };
  }

  const user = await consumePasswordResetToken(parsed.data.token);
  if (!user) {
    return { ok: false, error: "This password reset link is invalid or has expired." };
  }

  const newHash = await hashPassword(parsed.data.newPassword);
  await prisma.adminUser.update({
    where: { id: user.id },
    data: {
      passwordHash: newHash,
      mustChangePassword: false,
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  });

  // A password reset must revoke every existing session for this account —
  // including one an attacker who had the old (now-compromised) password
  // might be holding.
  await destroyAllSessionsForUser(user.id);

  return { ok: true };
}

export async function changePasswordAction(
  currentPassword: string,
  newPassword: string
): Promise<ActionResult> {
  const parsed = changePasswordSchema.safeParse({ currentPassword, newPassword });
  if (!parsed.success) {
    return { ok: false, error: "Invalid request." };
  }

  const user = await getSessionFromCookie();
  if (!user) {
    return { ok: false, error: "Your session has expired. Please log in again." };
  }

  const validCurrent = await verifyPassword(user.passwordHash, parsed.data.currentPassword);
  if (!validCurrent) {
    return { ok: false, error: "Current password is incorrect." };
  }

  const strength = isPasswordStrong(parsed.data.newPassword);
  if (!strength.ok) {
    return { ok: false, error: strength.reason ?? "Password is not strong enough." };
  }

  const newHash = await hashPassword(parsed.data.newPassword);
  await prisma.adminUser.update({
    where: { id: user.id },
    data: { passwordHash: newHash, mustChangePassword: false },
  });

  const cookieStore = await cookies();
  const currentToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (currentToken) {
    await destroyOtherSessionsForUser(user.id, currentToken);
  }

  return { ok: true };
}

export async function verifyEmailAction(token: string): Promise<ActionResult> {
  const ip = await getClientIp();
  const rl = await checkRateLimit(`admin-verify-email:${ip}`, { limit: 10, windowSeconds: 300 });
  if (!rl.allowed) {
    return { ok: false, error: "Too many attempts. Please wait a few minutes and try again." };
  }

  const parsed = verifyEmailSchema.safeParse({ token });
  if (!parsed.success) {
    return { ok: false, error: "Invalid verification link." };
  }

  const user = await consumeVerificationToken(parsed.data.token);
  if (!user) {
    return { ok: false, error: "This verification link is invalid or has expired." };
  }

  await prisma.adminUser.update({
    where: { id: user.id },
    data: { emailVerifiedAt: new Date() },
  });

  return { ok: true };
}

// Not called anywhere yet in this slice (account creation is out of scope —
// admin accounts are provisioned by the seed script for now), but wired up
// so a future admin-user-creation flow can send the verification email
// through the same token machinery without re-deriving it.
export async function sendVerificationEmailForUser(adminUserId: string, email: string): Promise<void> {
  const token = await createVerificationToken(adminUserId);
  await sendVerificationEmail(email, token);
}
