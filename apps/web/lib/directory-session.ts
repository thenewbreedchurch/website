import "server-only";
import crypto from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma, type DirectoryUser } from "@nb-church/db";

// Directory accounts (vendors and reviewers). Same design as the admin
// session system in lib/session.ts — server-stored, hashed-at-rest tokens in
// an httpOnly cookie — but a SEPARATE cookie and table, so a directory login
// can never be mistaken for an admin one (and vice versa).

export const DIRECTORY_COOKIE_NAME = "nbc_directory_session";
const ABSOLUTE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30-day hard ceiling
const IDLE_TTL_MS = 24 * 60 * 60 * 1000; // signed out after 24h without a visit
const TOUCH_AFTER_MS = 5 * 60 * 1000; // don't write lastActiveAt on every render

const hashToken = (token: string) => crypto.createHash("sha256").update(token).digest("hex");

export async function createDirectorySession(userId: string): Promise<void> {
  const token = crypto.randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + ABSOLUTE_TTL_MS);
  await prisma.directorySession.create({ data: { sessionToken: hashToken(token), userId, expiresAt } });
  (await cookies()).set(DIRECTORY_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

/** The signed-in directory user, or null. Memoised per request. */
export const getDirectoryUser = cache(async (): Promise<DirectoryUser | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(DIRECTORY_COOKIE_NAME)?.value;
  if (!token) return null;

  const session = await prisma.directorySession.findUnique({
    where: { sessionToken: hashToken(token) },
    include: { user: true },
  });
  if (!session) return null;

  const now = Date.now();
  if (session.expiresAt.getTime() < now || session.lastActiveAt.getTime() + IDLE_TTL_MS < now) {
    await prisma.directorySession.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  if (now - session.lastActiveAt.getTime() > TOUCH_AFTER_MS) {
    await prisma.directorySession.update({ where: { id: session.id }, data: { lastActiveAt: new Date() } }).catch(() => {});
  }
  return session.user;
});

export async function destroyDirectorySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(DIRECTORY_COOKIE_NAME)?.value;
  if (token) await prisma.directorySession.deleteMany({ where: { sessionToken: hashToken(token) } });
  cookieStore.delete(DIRECTORY_COOKIE_NAME);
}

export async function destroyAllDirectorySessions(userId: string): Promise<void> {
  await prisma.directorySession.deleteMany({ where: { userId } });
}

/** For server components/actions that need a signed-in user; redirects to sign-in otherwise. */
export async function requireDirectoryUser(next = "/marketplace/dashboard"): Promise<DirectoryUser> {
  const user = await getDirectoryUser();
  if (!user) redirect(`/marketplace/sign-in?next=${encodeURIComponent(next)}`);
  return user;
}
