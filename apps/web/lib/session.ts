import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { prisma, type AdminUser } from "@nb-church/db";

// Custom, hand-rolled admin session system (deliberately not NextAuth — see
// HANDOFF.md decision log). Sessions are stored server-side in AdminSession
// so logout / password-reset can actually revoke access, and the 15-minute
// idle timeout can be enforced on the server rather than trusted to a
// client-side timer alone.

export const SESSION_COOKIE_NAME = "nbc_admin_session";
const SESSION_ABSOLUTE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7-day hard ceiling
const IDLE_TIMEOUT_MINUTES = Number(process.env.ADMIN_SESSION_IDLE_MINUTES ?? "15");

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function cookieOptions(expiresAt: Date) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    expires: expiresAt,
  };
}

export async function createSession(adminUserId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString("base64url");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_ABSOLUTE_TTL_MS);

  await prisma.adminSession.create({
    data: {
      sessionToken: tokenHash,
      adminUserId,
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, cookieOptions(expiresAt));

  return token;
}

export async function getSessionFromCookie(): Promise<AdminUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const tokenHash = hashToken(token);
  const session = await prisma.adminSession.findUnique({
    where: { sessionToken: tokenHash },
    include: { adminUser: true },
  });

  if (!session) return null;

  const now = new Date();
  const idleCutoff = new Date(session.lastActiveAt.getTime() + IDLE_TIMEOUT_MINUTES * 60 * 1000);

  if (session.expiresAt < now || idleCutoff < now) {
    // Fail closed: destroy the stale/idle session server-side rather than
    // silently letting the cookie linger.
    await prisma.adminSession.delete({ where: { id: session.id } }).catch(() => {});
    cookieStore.delete(SESSION_COOKIE_NAME);
    return null;
  }

  await prisma.adminSession.update({
    where: { id: session.id },
    data: { lastActiveAt: now },
  });

  return session.adminUser;
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    const tokenHash = hashToken(token);
    await prisma.adminSession.deleteMany({ where: { sessionToken: tokenHash } });
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function destroyAllSessionsForUser(adminUserId: string): Promise<void> {
  await prisma.adminSession.deleteMany({ where: { adminUserId } });
}

export async function destroyOtherSessionsForUser(
  adminUserId: string,
  keepToken: string
): Promise<void> {
  const keepHash = hashToken(keepToken);
  await prisma.adminSession.deleteMany({
    where: { adminUserId, sessionToken: { not: keepHash } },
  });
}
