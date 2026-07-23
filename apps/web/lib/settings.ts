import { unstable_cache } from "next/cache";
import { prisma, type ChurchSettings, type ServiceTime } from "@nb-church/db";
import { getCached } from "./cache";

// Both exports below are read on nearly every page render (header/footer,
// contact info, service-time listings) — this is the one file every
// page-building agent should import instead of querying Prisma directly, so
// cache invalidation stays centralized here.
//
// Two caching layers, per the plan:
//   1. Redis (`getCached`) — a short-TTL cross-instance cache in front of the
//      DB read itself.
//   2. Next.js `unstable_cache`, tagged so admin Server Actions can call
//      `revalidateTag('church-settings')` / `revalidateTag('service-times')`
//      for instant on-demand invalidation of the ISR layer after a save.
//
// Admin mutation actions (owned by a different agent, see apps/web/app/admin)
// are responsible for calling both `invalidateCache('church-settings')` and
// `revalidateTag('church-settings')` after writing — this file only defines
// the read path and its cache keys/tags.

const CHURCH_SETTINGS_CACHE_KEY = "church-settings";
const SERVICE_TIMES_CACHE_KEY = "service-times";

async function fetchChurchSettings(): Promise<ChurchSettings> {
  return prisma.churchSettings.findUniqueOrThrow({ where: { id: "singleton" } });
}

const getChurchSettingsCached = unstable_cache(
  () => getCached(CHURCH_SETTINGS_CACHE_KEY, 120, fetchChurchSettings),
  [CHURCH_SETTINGS_CACHE_KEY],
  { tags: [CHURCH_SETTINGS_CACHE_KEY], revalidate: 120 }
);

/**
 * Returns the singleton ChurchSettings row (contact info, socials,
 * livestream/meeting links, org name/tagline). Always resolves — the row is
 * created by `packages/db/prisma/seed.ts` and never deleted.
 */
export async function getChurchSettings(): Promise<ChurchSettings> {
  return getChurchSettingsCached();
}

async function fetchServiceTimes(): Promise<ServiceTime[]> {
  return prisma.serviceTime.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }],
  });
}

const getServiceTimesCached = unstable_cache(
  () => getCached(SERVICE_TIMES_CACHE_KEY, 120, fetchServiceTimes),
  [SERVICE_TIMES_CACHE_KEY],
  { tags: [SERVICE_TIMES_CACHE_KEY], revalidate: 120 }
);

/**
 * Returns all active ServiceTime rows ordered by sortOrder — the fixed
 * weekly rhythm (Sunday School/Service, Wednesday Bible Study, daily
 * prayers). Bounded list (currently 15 rows), safe to fetch unpaginated.
 */
export async function getServiceTimes(): Promise<ServiceTime[]> {
  return getServiceTimesCached();
}
