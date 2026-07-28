import { headers } from "next/headers";
import { redis } from "./redis";

export interface RateLimitOptions {
  limit: number;
  windowSeconds: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
}

// Fixed-window counter on Redis: INCR the window key, set its expiry only on
// the first hit in the window. Good enough at this traffic level — no need
// for a sliding-window library. Reuses the same Redis connection used for
// caching (lib/cache.ts), per the plan's "one connection, two purposes".
export async function checkRateLimit(
  key: string,
  opts: RateLimitOptions
): Promise<RateLimitResult> {
  const windowKey = `ratelimit:${key}:${Math.floor(Date.now() / 1000 / opts.windowSeconds)}`;

  try {
    const count = await redis.incr(windowKey);
    if (count === 1) {
      await redis.expire(windowKey, opts.windowSeconds);
    }

    return {
      allowed: count <= opts.limit,
      remaining: Math.max(0, opts.limit - count),
    };
  } catch (err) {
    // Fail open: a degraded/unreachable Redis (bounded to ~1s per command
    // by commandTimeout, see lib/redis.ts) should never turn into a
    // multi-second stall — or an outright failure — on a real user action.
    // Worst case during an outage, rate limiting is briefly ineffective,
    // which is the right tradeoff for a low-traffic site.
    console.error(`[rate-limit] check failed for "${key}":`, (err as Error).message);
    return { allowed: true, remaining: opts.limit };
  }
}

// Server Actions don't receive a request object directly, so the caller's IP
// is read from forwarded headers via next/headers. Falls back to a constant
// key if no IP is present (e.g. local dev without a proxy) so rate limiting
// still functions, just coarser (shared bucket).
export async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwardedFor = h.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]!.trim();
  }
  const realIp = h.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}
