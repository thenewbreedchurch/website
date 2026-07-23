# Handoff

This is a living document. **Every fix or phase gets a dated changelog entry appended here when it lands** — this file should always describe the true current state of the system, not just where it started.

---

## Action items for the church admin (things I cannot do on your behalf)

- [ ] **Rotate exposed secrets** found in the legacy `server/.env` and `server/firebase-adminsdk.json`: the Firebase service-account private key, the Paystack secret key, the Gmail app password (`EMAIL_PASSWORD`/`EMAIL_PASSWORD1`), and the YouTube Data API key. These sat unencrypted on disk in the old repo and should be treated as compromised regardless of git history.
- [ ] Create accounts (or confirm you already have them) for: **Vercel**, **Neon**, **Upstash**, **Resend** — I can scaffold config against these but can't sign up on your behalf.
- [ ] Confirm the leadership names/titles seeded from the old About page (`Pastor Idowu Iluyomade — Senior Pastor`, `Pastor Gbenga Olaniyan — Pastor`) are current and correctly spelled before they go live with photos.
- [ ] Review the New Converts page pastoral copy before treating it as final (flagged inline when written).
- [ ] Final visual curation pass over `_legacy-static-site/client/images/` — I've categorized by filename/metadata, but a human should confirm which photos represent the church well for hero/first-timers/new-converts sections.

## Known limitations / deferred scope

- **Paystack / live online payment is not built.** `give` page shows bank-transfer details only (matching the legacy site's actual functionality — Paystack was present in the old code but commented out and never finished). The data model supports adding it later without a migration.
- **No kids'/children's ministry section** on First Timers — confirmed with the church that no such program currently exists; nothing was invented.
- **Partitioning** on high-growth tables (`EventRegistration`, `ContactMessage`, `NewsletterSubscriber`) is designed for (createdAt-first composite indexes) but not physically implemented — premature at current traffic. Revisit if registration volume grows significantly.
- **CSRF tokens are intentionally not implemented.** Next.js Server Actions verify the `Origin` header against the deployment origin by default, which covers same-origin mutation safety. The public forms (newsletter, contact, event registration) are anonymous by design — there's no ambient session to hijack. `/admin` is protected by a `SameSite=Lax` NextAuth session cookie plus the same Origin check. If an admin mutation is ever implemented as a plain Route Handler instead of a Server Action, add an explicit Origin/Referer check for `/api/admin/*`.

## Account ownership map

_To be filled in as each production service is actually provisioned (Phase A/G). Placeholder until then:_

| Service | Purpose | Owner login |
|---|---|---|
| Vercel | App hosting | _pending_ |
| Neon | Postgres | _pending_ |
| Upstash | Redis (cache + rate limit) | _pending_ |
| Resend | Transactional email | _pending_ |
| Domain registrar | thenewbreedchurch.org DNS | _pending — currently pointed at Gigalayer_ |
| Gigalayer | Legacy static host, to be decommissioned after DNS cutover | existing account |

## Admin panel usage

_To be filled in once `/admin` is built (Phase E)._ Will cover: how to edit Church Settings, Service Times, Announcements, Sermons, Testimonies, Giving Accounts, Next Steps content, and how to add another admin user (`ADMIN_ALLOWLIST_EMAILS` + redeploy).

## Backup / restore

_To be filled in once Neon is provisioned (Neon has automatic point-in-time restore on paid tiers; document the free-tier equivalent once confirmed)._

---

## Decision log

- **Next.js (full-stack) over a plain Vite SPA + separate Express backend.** The user's original ask was React+Vite specifically, but a client-only SPA needs a bolt-on prerenderer to be indexable by search engines, and a public church site's traffic depends heavily on search ("church near me," etc). Next.js gives SSR/ISR, same-origin Server Actions (replacing Express + CORS entirely), and one deployable app instead of two. Confirmed with the user before building.
- **Postgres via Prisma over keeping Firestore.** The legacy site had subscriber data split across a flat JSON file and Firestore for the same concept — a real, live inconsistency. Consolidating into one relational store with real foreign keys (registrations → announcements) fixes this at the root and removes the `firebase-admin`/`firebase`/`googleapis` dependency tree (and its exposed service-account key) from the stack entirely.
- **No CSRF tokens** — see "Known limitations" above for the full rationale.
- **Redis is used for both caching and rate limiting** (one connection, two purposes) rather than standing up separate mechanisms — right-sized for this traffic level.
- **Migrations run automatically**: via a Docker entrypoint (`scripts/entrypoint.sh`, runs `prisma migrate deploy` before the app starts) for both local Docker and the production container image, and via the Vercel build command for the Vercel deployment path (`prisma migrate deploy && next build` — migrating at build time rather than serverless cold-start avoids concurrent-instance migration races).
- **Full custom admin panel over a headless CMS.** Postgres+Prisma was already required for transactional data (registrations, subscribers, contact messages); extending the same schema to cover editorial content preserves referential integrity a headless CMS wouldn't give for free, and avoids syncing two systems.

---

## Changelog

### 2026-07-23 — Phase A: repo scaffold

- Archived the legacy static site (`client/`, `server/`, `.hintrc`) into `_legacy-static-site/`, preserving `server/`'s own git history intact (nested repo, untouched) rather than deleting it.
- Initialized a fresh git repo at the project root (the old root had none — it was living inside the user's home-directory git repo).
- Scaffolded a pnpm workspace: `apps/web` (Next.js 16, App Router, TypeScript, Tailwind v4, ESLint), `packages/db` (Prisma, Postgres), `packages/config` (shared tsconfig).
- Wrote the initial Prisma schema (`packages/db/prisma/schema.prisma`) covering `ChurchSettings`, `ServiceTime`, `Announcement`, `EventRegistration`, `NewsletterSubscriber`, `ContactMessage`, `Sermon`, `Testimony`, `StaffMember`, `GivingAccount`, `NextStep`, `AdminUser` — indexed on every foreign key and list-query field per the enterprise-standards requirement.
- Wrote `packages/db/prisma/seed.ts` with **real** production content ported from the legacy HTML (service times, contact info, the two real giving-account sets — Offerings & Tithe and Favoured Fund — and named leadership), not placeholders. Verified against `_legacy-static-site/client/donate.html` line-by-line for account numbers/bank names.
- Set up `docker-compose.yml` (postgres, pgadmin, redis, web) and `apps/web/Dockerfile` (dev + production standalone-build stages). `scripts/entrypoint.sh` runs `prisma migrate deploy` automatically before the app starts in both stages.
- Verified end-to-end locally: `docker compose up -d postgres pgadmin redis` → migration applied → seed run → confirmed real data landed correctly via `psql` (service times, giving accounts, church settings all match the legacy site).
- Shipped `.env.example` documenting both local-Docker and production (Neon/Upstash) variable shapes side by side.
- **Not yet done**: security middleware/CSP, validation/rate-limit/cache libs, Server Actions, auth, the design system, any pages, the image pipeline, CI workflow. These are Phases B–G, in progress next.
