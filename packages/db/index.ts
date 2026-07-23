import path from "node:path";
import { config as loadEnv } from "dotenv";
import { PrismaClient } from "./generated/client";

// Load the repo-root .env before the client below reads DATABASE_URL, so this
// module works whether it's imported by Next.js (which loads its own env),
// the Prisma CLI (which loads env via prisma.config.ts), or a bare `tsx`
// invocation (e.g. `tsx prisma/seed.ts`) that has loaded nothing yet.
if (!process.env.DATABASE_URL) {
  loadEnv({ path: path.join(__dirname, "..", "..", ".env") });
}

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
