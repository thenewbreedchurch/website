import "server-only";
import crypto from "node:crypto";
import { prisma, type AdminUser } from "@nb-church/db";

// Verification / password-reset tokens. Plaintext is emailed to the user and
// never persisted; only its SHA-256 hash is stored, so a database read alone
// can never be used to verify an email or reset a password. SHA-256 (not
// argon2) is correct here: these are high-entropy random lookup values, not
// user-chosen secrets, so there's nothing to slow-hash against brute force.

const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000; // 24h
const RESET_TTL_MS = 60 * 60 * 1000; // 1h

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function generateToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}

export async function createVerificationToken(adminUserId: string): Promise<string> {
  await prisma.adminVerificationToken.deleteMany({
    where: { adminUserId, usedAt: null },
  });

  const token = generateToken();
  await prisma.adminVerificationToken.create({
    data: {
      adminUserId,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + VERIFICATION_TTL_MS),
    },
  });

  return token;
}

export async function createPasswordResetToken(adminUserId: string): Promise<string> {
  await prisma.adminPasswordResetToken.deleteMany({
    where: { adminUserId, usedAt: null },
  });

  const token = generateToken();
  await prisma.adminPasswordResetToken.create({
    data: {
      adminUserId,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + RESET_TTL_MS),
    },
  });

  return token;
}

export async function consumeVerificationToken(plainToken: string): Promise<AdminUser | null> {
  const tokenHash = hashToken(plainToken);
  const record = await prisma.adminVerificationToken.findUnique({
    where: { tokenHash },
    include: { adminUser: true },
  });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return null;
  }

  await prisma.adminVerificationToken.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });

  return record.adminUser;
}

export async function consumePasswordResetToken(plainToken: string): Promise<AdminUser | null> {
  const tokenHash = hashToken(plainToken);
  const record = await prisma.adminPasswordResetToken.findUnique({
    where: { tokenHash },
    include: { adminUser: true },
  });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return null;
  }

  await prisma.adminPasswordResetToken.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });

  return record.adminUser;
}
