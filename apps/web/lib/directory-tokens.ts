import "server-only";
import crypto from "node:crypto";
import { prisma, type DirectoryUser } from "@nb-church/db";

// One-time email-verification and password-reset tokens. Plaintext is emailed
// and never stored; only its SHA-256 hash is (high-entropy random values, so a
// fast hash is correct) — same scheme as lib/admin-tokens.ts.

const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;
const RESET_TTL_MS = 60 * 60 * 1000;

const hashToken = (t: string) => crypto.createHash("sha256").update(t).digest("hex");
const generateToken = () => crypto.randomBytes(32).toString("base64url");

export async function createDirectoryVerificationToken(userId: string): Promise<string> {
  await prisma.directoryVerificationToken.deleteMany({ where: { userId, usedAt: null } });
  const token = generateToken();
  await prisma.directoryVerificationToken.create({
    data: { userId, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + VERIFICATION_TTL_MS) },
  });
  return token;
}

export async function createDirectoryResetToken(userId: string): Promise<string> {
  await prisma.directoryPasswordResetToken.deleteMany({ where: { userId, usedAt: null } });
  const token = generateToken();
  await prisma.directoryPasswordResetToken.create({
    data: { userId, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + RESET_TTL_MS) },
  });
  return token;
}

export async function consumeDirectoryVerificationToken(plain: string): Promise<DirectoryUser | null> {
  const record = await prisma.directoryVerificationToken.findUnique({ where: { tokenHash: hashToken(plain) }, include: { user: true } });
  if (!record || record.usedAt || record.expiresAt < new Date()) return null;
  await prisma.directoryVerificationToken.update({ where: { id: record.id }, data: { usedAt: new Date() } });
  return record.user;
}

export async function consumeDirectoryResetToken(plain: string): Promise<DirectoryUser | null> {
  const record = await prisma.directoryPasswordResetToken.findUnique({ where: { tokenHash: hashToken(plain) }, include: { user: true } });
  if (!record || record.usedAt || record.expiresAt < new Date()) return null;
  await prisma.directoryPasswordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } });
  return record.user;
}
