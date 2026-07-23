import argon2 from "argon2";

// Thin argon2id wrapper used for real account passwords. Verification/reset
// tokens use a separate SHA-256 helper in lib/admin-tokens.ts — a fast hash
// is correct there since those are high-entropy random lookup values, not
// user-chosen secrets that need to resist offline brute-forcing.

export async function hashPassword(plain: string): Promise<string> {
  return argon2.hash(plain, { type: argon2.argon2id });
}

export async function verifyPassword(hash: string, plain: string): Promise<boolean> {
  return argon2.verify(hash, plain);
}

export function isPasswordStrong(plain: string): { ok: boolean; reason?: string } {
  if (plain.length < 12) {
    return { ok: false, reason: "Password must be at least 12 characters long." };
  }
  if (!/[a-zA-Z]/.test(plain)) {
    return { ok: false, reason: "Password must contain at least one letter." };
  }
  if (!/[0-9]/.test(plain)) {
    return { ok: false, reason: "Password must contain at least one number." };
  }
  return { ok: true };
}
