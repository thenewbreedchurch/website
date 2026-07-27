import { PrismaClient } from "./generated/client";

// This module assumes DATABASE_URL is already set by the time it's
// imported — true for Next.js (loads its own env) and the Prisma CLI
// (loads env via prisma.config.ts). It deliberately does NOT fall back to
// loading .env itself: that used to live here via a __dirname-based path,
// which is a Node-only global — a previous version of this shipped and
// caused a hard-to-diagnose production 500 (MIDDLEWARE_INVOCATION_FAILED,
// "ReferenceError: __dirname is not defined") once __dirname ended up
// statically traced into an Edge Runtime bundle, despite this module never
// actually being imported by that code path at runtime. Removing every
// Node-only global from this shared package — not just guarding it — is
// what actually guarantees that can't happen again, regardless of what
// ends up importing this module in the future. The one real caller that
// needs a fallback (a bare `tsx prisma/seed.ts` invocation, which has
// nothing pre-loaded) now loads env itself, in seed.ts, before importing
// this module.

declare global {
  // eslint-disable-next-line no-var
  var __nbChurchPrisma: PrismaClient | undefined;
}

// Reuse a single client across Next.js hot-reloads in dev; a fresh client
// per invocation in serverless prod would exhaust the Neon connection pool.
export const prisma =
  global.__nbChurchPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.__nbChurchPrisma = prisma;
}

export * from "./generated/client";
