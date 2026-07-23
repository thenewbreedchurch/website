import Redis from "ioredis";

// Singleton ioredis client, mirroring the hot-reload-safe pattern in
// packages/db/index.ts (a fresh client per Next.js dev hot-reload would leak
// connections). Points at local Docker Redis via REDIS_URL in dev; in
// production this same connection string shape is provided by Upstash's
// redis:// endpoint, or swap to @upstash/redis's REST client if a future
// deploy target can't hold a persistent TCP connection (documented, not
// implemented, per the Phase B1 brief).

declare global {
  var __nbChurchRedis: Redis | undefined;
}

const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";

export const redis =
  global.__nbChurchRedis ??
  new Redis(REDIS_URL, {
    maxRetriesPerRequest: 3,
    lazyConnect: false,
  });

redis.on("error", (err) => {
  console.error("[redis] connection error:", err.message);
});

if (process.env.NODE_ENV !== "production") {
  global.__nbChurchRedis = redis;
}
