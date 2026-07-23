import { redis } from "./redis";

// Thin get-or-set wrapper over Redis for the specific hot-path caches in
// lib/settings.ts. Not a general caching framework — keep additions here
// minimal and purpose-built.

export async function getCached<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const cached = await redis.get(key).catch((err) => {
    console.error(`[cache] get failed for "${key}":`, err.message);
    return null;
  });

  if (cached !== null) {
    try {
      return JSON.parse(cached) as T;
    } catch {
      // Fall through and refetch if the cached payload is somehow corrupt.
    }
  }

  const fresh = await fetcher();

  await redis.set(key, JSON.stringify(fresh), "EX", ttlSeconds).catch((err) => {
    console.error(`[cache] set failed for "${key}":`, err.message);
  });

  return fresh;
}

export async function invalidateCache(key: string): Promise<void> {
  await redis.del(key).catch((err) => {
    console.error(`[cache] invalidate failed for "${key}":`, err.message);
  });
}
