import path from "node:path";
import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

// Prisma config files disable Prisma's automatic .env loading, so load the
// repo-root .env explicitly (same file Docker Compose and apps/web read).
loadEnv({ path: path.join(__dirname, "..", "..", ".env") });

export default defineConfig({
  schema: path.join(__dirname, "prisma", "schema.prisma"),
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
