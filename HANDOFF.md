# Handoff

This is a living document. **Every fix or phase gets a dated changelog entry appended here when it lands** — this file should always describe the true current state of the system, not just where it started.

---

## Action items for the church admin (things I cannot do on your behalf)

- [ ] **Rotate exposed secrets** found in the legacy `server/.env` and `server/firebase-adminsdk.json`: the Firebase service-account private key, the Paystack secret key, the Gmail app password (`EMAIL_PASSWORD`/`EMAIL_PASSWORD1`), and the YouTube Data API key. These sat unencrypted on disk in the old repo and should be treated as compromised regardless of git history.
- [ ] Create accounts (or confirm you already have them) for: **Vercel**, **Neon**, **Upstash**, **Resend** — I can scaffold config against these but can't sign up on your behalf.
- [ ] Confirm the leadership names/titles seeded from the old About page (`Pastor Idowu Iluyomade — Senior Pastor`, `Pastor Gbenga Olaniyan — Pastor`) are current and correctly spelled before they go live with photos.
- [ ] Review the New Converts page pastoral copy before treating it as final (flagged inline when written).
- [ ] Light human sanity-check on the image curation below — I did a full visual pass (viewed all 56 congregation photos via contact sheets, not just filenames/metadata) and picked photos I judged to read well for each section's purpose, but a human who knows the individuals/events pictured should confirm nothing is mis-categorized (e.g. an outreach-day photo landing in "first-timers") or that anyone photographed would prefer not to be featured.

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

### 2026-07-23 — Phase B1: public-mutation plumbing (validation, Redis, cache, email, Server Actions)

Built the non-admin data/mutation layer in `apps/web/` that every public form (newsletter, contact, event registration) and every page's header/footer will run through. Scope was explicitly "plumbing, not new content" — no placeholder copy was invented; `getChurchSettings()`/`getServiceTimes()` were verified against the real seeded data (see verification below).

**New files:**
- `apps/web/lib/validation.ts` — `subscribeSchema`, `contactSchema`, `eventRegistrationSchema` (zod), each with an inferred exported type. Replaces the legacy bare-truthy-check pattern (`if (!to) ...` in `_legacy-static-site/server/routes/subscribe.js`) with real min/max/format validation.
- `apps/web/lib/redis.ts` — singleton `ioredis` client reading `REDIS_URL`, hot-reload-safe (same `global.__x` guard pattern as `packages/db/index.ts`).
- `apps/web/lib/rate-limit.ts` — `checkRateLimit(key, {limit, windowSeconds})` (fixed-window `INCR`+`EXPIRE` on Redis) and `getClientIp()` (reads `x-forwarded-for`/`x-real-ip` via `next/headers` — Server Actions have no request object).
- `apps/web/lib/cache.ts` — `getCached<T>(key, ttlSeconds, fetcher)` get-or-set wrapper and `invalidateCache(key)`, both thin wrappers over the Redis client above.
- `apps/web/lib/settings.ts` — `getChurchSettings()` and `getServiceTimes()`, each double-cached (Redis via `getCached`, 120s TTL, *and* Next.js `unstable_cache` tagged `'church-settings'`/`'service-times'` for the ISR layer). This is the file every other page-building agent should import for header/footer/contact-info data instead of querying Prisma directly — **admin mutation actions must call both `invalidateCache(...)` and `revalidateTag(...)` after writing to Church Settings or Service Times, or the cache will drift from the DB for up to 120s.** That invalidation call is *not* wired up yet since it belongs to the admin CRUD actions (out of this phase's scope) — flagging so the admin-panel phase doesn't miss it.
- `apps/web/lib/email.ts` — Resend client + `sendNewsletterWelcomeEmail`, `sendContactNotificationEmail`, `sendEventRegistrationConfirmation`. All three catch/log internally and never throw, so a Resend failure (expected right now — `RESEND_API_KEY` is still the `re_xxx...` placeholder) never fails the underlying DB write. Verified this decoupling live: registration/contact/subscribe all succeeded and wrote to Postgres while Resend logged `401 API key is invalid` in the background.
- `apps/web/emails/*.tsx` — `newsletter-welcome.tsx`, `contact-notification.tsx`, `event-registration-confirmation.tsx`, built with `@react-email/components`. JSX children auto-escape all user input (name, message, etc.) — this is the structural fix for the legacy raw-string-interpolation-into-HTML-email pattern in `_legacy-static-site/server/routes/subscribe.js`.
- `apps/web/lib/action-result.ts` — shared `ActionResult` discriminated type (`{ok:true, message?}` | `{ok:false, error, fieldErrors?}`) returned by all three actions below.
- `apps/web/actions/subscribe.ts` — `subscribeAction`. Single code path: upserts by email; reactivates an `UNSUBSCRIBED` row; returns a friendly ok-ish "already subscribed" result (not an error) for an already-`ACTIVE` row. Fixes the legacy two-subscriber-store split (flat file + Firestore) by construction — there's exactly one write path now.
- `apps/web/actions/contact.ts` — `contactAction`. Creates a `ContactMessage` (status `NEW`), fires the notification email to `CONTACT_NOTIFICATION_EMAIL`.
- `apps/web/actions/register.ts` — `registerForEventAction(announcementId, data)`. Creates an `EventRegistration`, catches the `@@unique([announcementId, email])` violation and returns a friendly "already registered" result instead of a 500 — fixes the legacy `event-confirmation.js` bug where an undefined `formValues` reference threw on every submission.
- `scripts/migrate-legacy-data.mjs` — one-time script (`node scripts/migrate-legacy-data.mjs`), reads `_legacy-static-site/server/data/subscribers.json` (currently empty — `[]`) plus Firestore's `subscribers`/`event_registrations` collections via `firebase-admin`, dedupes by email, upserts `NewsletterSubscriber` rows and best-effort-matches `EventRegistration` rows to an `Announcement` by exact case-insensitive title match, logging anything unmatched rather than dropping it. Per-record try/catch, prints a summary count. Not run against real Firestore yet — that's a deliberate call for the user to make since it touches real production data one last time before the Firebase key is rotated.

**Dependencies added:** `zod`, `ioredis`, `resend`, `@react-email/components` (apps/web); `firebase-admin`, `tsx`, `dotenv` (repo-root devDependencies, for the migration script). `pnpm-workspace.yaml`'s `allowBuilds` for `@firebase/util`/`protobufjs` set to `false` (neither needs install scripts for how they're used here).

**A real bug caught and fixed by the verification step below:** the first implementation of `registerForEventAction` checked `err instanceof Prisma.PrismaClientKnownRequestError` to detect the duplicate-registration unique-constraint violation. Under Turbopack, `@nb-church/db`'s `export * from "./generated/client"` (a CommonJS module) doesn't reliably preserve class identity across the app's module graph — Turbopack logs `unexpected export *` for this and the `instanceof` check silently failed, so a duplicate registration produced an unhandled 500 instead of the intended friendly message. Fixed by duck-typing (`'code' in err && err.code === 'P2002'`) instead, which is bundler-identity-agnostic. This is worth knowing for the admin-panel agent too if it does any similar Prisma-error-type narrowing.

**Verification performed** (against the live local Docker Postgres + Redis, not mocked):
- Confirmed `getChurchSettings()` and `getServiceTimes()` return the real seeded data (org name, address, all 15 active service times) via a temporary route handler, then deleted it.
- Exercised all three Server Actions through a temporary Next.js route handler (Server Actions require a real request scope for `next/headers()`, so they can't be called directly from a bare script) hitting a real `next dev` instance:
  - `contactAction`: valid submission created a row + fired the notification email attempt; invalid input returned the expected per-field zod errors.
  - `subscribeAction`: new email created `ACTIVE`; same email again returned the friendly "already subscribed" ok-result without a duplicate row; manually flipping the row to `UNSUBSCRIBED` and resubscribing correctly reactivated it.
  - `registerForEventAction`: valid registration created a row + confirmation email attempt; duplicate registration (same announcement+email) returned the friendly ok-result (this is what surfaced the `instanceof` bug above, now fixed and reverified); a non-existent announcement ID was rejected.
  - Rate limiting: fired 6 rapid subscribe calls, 6 rapid contact calls, and 11 rapid register calls from the same IP — each was blocked exactly at its configured threshold (5/10min, 5/10min, 10/10min respectively), confirmed against the actual Redis `INCR` counter state (including correctly surviving a dev-server restart, since Redis is a separate container).
  - `pnpm --filter @nb-church/web typecheck` and `pnpm --filter @nb-church/web lint` both clean.
- All test data (fake subscribers/contact messages/registrations, rate-limit and cache Redis keys, the temporary route handler) was deleted after verification — the DB and Redis are back to clean seeded state, nothing stray left in `apps/web/`.

**Deviations from the brief:** none of substance. The brief's suggested smoke-test approach (`tsx` script calling the actions directly) doesn't work as-is because Server Actions call `headers()` from `next/headers`, which throws outside a real Next.js request scope — verification was done via a temporary route handler under a real `next dev` server instead, then removed, which satisfies the same intent (real actions, real Postgres, real Redis, nothing mocked).

**For the next phase (pages / admin-panel agents):**
- Import `getChurchSettings`/`getServiceTimes` from `apps/web/lib/settings.ts` for any header/footer/contact-info/service-time display — don't query Prisma directly for these.
- Import `subscribeAction`/`contactAction`/`registerForEventAction` from `apps/web/actions/*.ts` for the newsletter, contact, and event-registration forms; all three return the `ActionResult` type from `apps/web/lib/action-result.ts` for field-level error rendering.
- **Admin Church Settings / Service Time save actions must call `invalidateCache('church-settings' | 'service-times')` (from `lib/cache.ts`) and `revalidateTag('church-settings' | 'service-times')` (from `next/cache`) after writing**, or public pages will show stale data for up to 120s.
- `scripts/migrate-legacy-data.mjs` has not been run against real Firestore yet — do so once ready, before rotating the Firebase key (see action items above).

### 2026-07-23 — Phase F: image pipeline, curation, and favicon fix

Built the source-image pipeline and produced the curated, optimized image set page-building agents should now use instead of reaching into `_legacy-static-site/`.

**Curation method:** Did a full visual pass, not a filename/metadata guess — generated 500px-wide preview thumbnails of all 56 `DSC*.jpg` raw camera photos via `sharp`, tiled them into 5 labeled contact sheets, and viewed every one before assigning sections. Re-ran a fresh `grep` sweep of every `_legacy-static-site/client/*.html`/`*.css`/`*.js` file for image filenames (not trusting the prior pass's dead/used list blindly) to confirm what's actually referenced.

**Grep findings (superseding the earlier dead/used list where it differed):**
- Confirmed genuinely dead, zero references anywhere: `ExcitedEntrepreneur-740x410.jpg`, `concept-1868728_1280.jpg`, `cultural-diversity-2.jpg`, `family-3347049_1280.jpg`, `journey-1130732_1280.jpg`, `man-593333_1280.jpg`, `talk_circle.jpg`, `to-offer-427297_1920.jpg`, `ubuntu.jpg`, `IMG_7440.PNG`. Left out of the new `public/images/`.
- The four "needs a final check" files (`ffp.png`, `fund_pitch.webp`, `look_here.webp`, `hands_in.png`) are confirmed dead too — checked `donate.html`'s Favoured Fund section specifically; it's a plain text link to `https://ffp.thenewbreedchurch.org`, no image tag at all.
- Found *additional* broken references beyond the ones flagged previously: `events.html` references `./images/NB_thanksgiving2.jpg`, `./images/clothes_drive.JPG`, and `./images/Worship+Hands+Raised.jpg`; `index.css` references `./images/KE1.avif`, `./images/KE2.avif`, and `./images/DSC06833.avif` (all three back the "sermons pictures" `.image-placeholder` rules). None of these six ever existed under any name in `images/` (confirmed by directory listing, not just extension-swap guessing) — genuinely lost source material, not recoverable. This is *why* the sermons section had zero real fallback images live on the old site; the new curated `sermons/` set (below) fixes that gap for the first time.
- Every other referenced filename (`IMG_7439.PNG`, `NB_logo.png`, `t-5.avif`→`t-5.jpg`, `DSC00357`, `DSC00553`, `DSC00763`, `DSC00905`, `DSC00001`, `DSC02683`, `DSC09454`, `DSC09751`, `DSC09849`, `connect.jpg`, `ubuntu2.jpg`) has a real `.jpg`/`.PNG` source on disk and was carried forward into the curated set below (in most cases re-cropped/renamed, and in a couple of cases the agent chose a *different*, better photo than the original broken `.avif` reference pointed at — e.g. the old hero carousel's `DSC09751` slide was swapped for stronger candidates found during the visual pass; `DSC09751` itself is still included, just recategorized into `general/`).

**`scripts/prepare-images.mjs`** (new, Node ESM, `sharp` — added as a root devDependency, `pnpm-workspace.yaml`'s `allowBuilds.sharp` was already `true` from Phase A): a manifest array of `{ source, dest, maxWidth, quality }` entries drives resize + `mozjpeg` recompression + metadata stripping. `.withMetadata()` is deliberately never called, which makes sharp strip all EXIF/IPTC/XMP (including GPS) from every output by default — a real privacy consideration since these are photos of real congregants, not just file-size hygiene. Idempotent via mtime comparison (dest skipped if newer than source); `--force` reprocesses everything. Run via `node scripts/prepare-images.mjs`.

**Curated output — `apps/web/public/images/{section}/`** (46 files from 44 unique source photos, ~41 of the 56 raw `DSC*` photos used at least once; the ~15 left out were near-duplicate angles of an already-used scene, not a category gap):
| Section | Count | Max width | Notes |
|---|---|---|---|
| `hero/` | 6 | 2400px | Full-bleed carousel/parallax: pulpit shots with visible venue signage, wide sanctuary establishing shot, worship/embrace moments |
| `about/` | 6 | 1600px | Includes the three images the legacy About page actually used (`about-mission-worship`, `about-vision-hall`, `about-livestream-audience`, re-cropped/renamed from `DSC00357`/`t-5`/`DSC00763`), plus a sanctuary-interior wide shot and a scripture/hands close-up |
| `first-timers/` | 5 | 1600px | Warm greeting/embrace/smiling shots — new section, no legacy equivalent existed |
| `new-converts/` | 4 | 1600px | Prayer/altar-response shots — new section, no legacy equivalent existed |
| `sermons/` | 3 | 800px | Preaching/pulpit fallback thumbnails — genuinely new; the legacy site's sermon-picture CSS rules (`KE1`/`KE2`/`DSC06833.avif`) never had real backing files (see grep findings above) |
| `announcements/` | 6 | 1200px | Community sports days, cultural events, outreach — includes `ubuntu2.jpg` (confirmed used in the legacy events grid) renamed to `announcements-community-unity.jpg` |
| `general/` | 15 | 1600px | Fallback worship/band/congregation pool for cross-page use, plus `connect.jpg` (the legacy linktree "Connect With Us" social graphic, kept at higher JPEG quality since it has on-image text) renamed to `general-connect-with-us.jpg` |

**Size result:** 372MB source (`_legacy-static-site/client/images/`, 75 files, mostly 9-20MB raw 6000x4000 camera JPEGs) → **7.6MB** total output across all 46 files — a ~98% reduction. Hero images average ~370KB (all under 1MB per the spec), card/thumbnail images (sermons, announcements) average well under 150KB (sermons max 71KB). Verified idempotency by re-running the script (0 written, 46 skipped, correct). Spot-checked several outputs with the Read tool for correct orientation/composition/crop and confirmed via `sharp().metadata()` that EXIF is stripped (`exif: false`) on output.

**Logo & favicon:**
- `apps/web/public/logo.png` — the real nav logo, from `IMG_7439.PNG` (confirmed the actual site-wide nav image via grep), trimmed of transparent padding and exported at 160px height (633×160, RGBA/transparent).
- **Deviation from the brief:** the brief named `NB_logo.png` as the favicon source, but on inspection it's a busy colorful event-flyer graphic (dark background, abstract shapes), not a clean logo mark — it would render as unrecognizable noise at 16×16/32×32. `IMG_7439.PNG` (the real nav logo) contains the same circular RCCG/New Breed seal cleanly isolated on a transparent background in its left ~210×210px square, so that crop was used as the favicon source instead. This keeps the browser-tab icon visually consistent with the actual nav logo and produces a legible mark at every size. `NB_logo.png` itself was left out of `public/` entirely — nothing in the new codebase references it (Next.js's file-based icon convention replaces the old `<link rel="icon" href="./images/NB_logo.png">` tag sitewide).
- Produced via `sharp`: `apps/web/app/icon.png` (512×512), `apps/web/app/apple-icon.png` (180×180), `apps/web/app/favicon.ico` (hand-built two-image ICO container wrapping 16×16 and 32×32 PNGs, since `sharp` can't write `.ico` directly). This is a real fix, not a cosmetic one — `apple-touch-icon.png` was referenced on every legacy page (`about.html`, `donate.html`, `events.html`, `index.html`, `linktree.html`) and never existed on disk; Next's App Router file convention now serves all three automatically with correct `<link>`/meta tags, no manual markup needed.
- All four output files spot-checked visually with the Read tool and confirmed valid via `file` (correct dimensions/formats).

**Not done / explicitly out of scope for this phase:** actually wiring these images into page components (`<Image src="/images/hero/...">` etc.) — that's the page-building agents' job in Phase D/E, this phase only produced the source-image inventory. The "final visual curation pending human review" action item above has been softened accordingly (full visual review was done by the agent, but a human who knows the people/events pictured should still sanity-check before these go live in production, per the updated action item at the top of this doc).

### 2026-07-23 — Phase B2: admin authentication (hand-rolled session system, not NextAuth)

Built the full admin login/session/lockout/password-reset system against the existing `AdminUser`/`AdminSession`/`AdminVerificationToken`/`AdminPasswordResetToken` models. **Deliberately not NextAuth** — the schema's precise lockout/mustChangePassword/idle-timeout requirements don't map cleanly onto NextAuth's adapter conventions, so this is a small, carefully-reviewed custom session system instead. (The doc comment above the `AdminUser` model in `schema.prisma` still references "NextAuth's Credentials provider" — that's a stale note from the Phase A scaffold; this system does not use NextAuth at all and `next-auth` was not added as a dependency.)

**New files:**
- `apps/web/lib/password.ts` — `hashPassword`/`verifyPassword` (argon2id via the `argon2` package, added as a direct `apps/web` dependency), `isPasswordStrong` (≥12 chars, ≥1 letter, ≥1 number — no fake entropy scoring).
- `apps/web/lib/session.ts` — `createSession`, `getSessionFromCookie`, `destroySession`, `destroyAllSessionsForUser`, `destroyOtherSessionsForUser`. Session tokens are 32 random bytes (`base64url`), only their SHA-256 hash is ever written to `AdminSession.sessionToken` — verified directly against Postgres during testing that the stored value never matches the plaintext cookie. Cookie name `nbc_admin_session`; `httpOnly: true`, `secure` only in production, `sameSite: 'lax'`, `path: '/'`.
- `apps/web/lib/admin-tokens.ts` — `createVerificationToken`/`createPasswordResetToken` (24h/1h expiry respectively, SHA-256-hashed at rest, any prior unused token for that user+purpose is deleted first) and their `consume*` counterparts (single-use, hash-lookup, expiry-checked).
- `apps/web/lib/admin-email.ts` — minimal `resend`-direct HTML-string senders for the two admin transactional emails (verification, password reset). Deliberately not sharing the other agent's `lib/email.ts`/`emails/*.tsx` infra — these two emails are short and low-volume, not worth blocking this slice on shared infra for, per the brief.
- `apps/web/actions/admin-auth.ts` — `loginAction`, `logoutAction`, `invalidateSessionAction` (non-redirecting logout variant for the session-timeout page), `requestPasswordResetAction`, `resetPasswordAction`, `changePasswordAction`, `verifyEmailAction`, `sendVerificationEmailForUser` (wired for a future admin-creation flow, not called yet). Reuses the other agent's `checkRateLimit`/`getClientIp` from `lib/rate-limit.ts` rather than rolling a separate rate-limit mechanism.
- `apps/web/middleware.ts` — lightweight cookie-presence check redirecting unauthenticated `/admin/*` requests to `/admin/login` (deep session validation happens in the Node-runtime `(protected)` layout, not here — Edge can't hold a Postgres connection), plus site-wide security headers (CSP, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, HSTS in production only). Next 16.2.11 prints a deprecation warning ("use `proxy` instead of `middleware`") — left as `middleware.ts` per the explicit brief; still fully functional, confirmed by testing. Worth revisiting the `proxy` rename in a later pass.
- `apps/web/components/admin/InactivityWatcher.tsx` — client-side idle timer (mousemove/keydown/click/scroll), navigates to `/admin/session-timeout` after `ADMIN_SESSION_IDLE_MINUTES`. UX-only; the real enforcement is server-side in `getSessionFromCookie()`.
- `apps/web/components/admin/ChangePasswordForm.tsx` — shared client form used by both the forced (`mustChangePassword`) and voluntary change-password flows.
- Pages: `app/admin/layout.tsx` (bare standalone shell, no site header/footer), `app/admin/login/page.tsx`, `app/admin/forgot-password/page.tsx`, `app/admin/reset-password/[token]/page.tsx`, `app/admin/verify/[token]/page.tsx` (server component, calls `verifyEmailAction` directly at render time), `app/admin/session-timeout/page.tsx` (calls `invalidateSessionAction` on mount, shows the expiry message, auto-redirects after 5s), `app/admin/(protected)/layout.tsx` (session guard + nav + `InactivityWatcher`), `app/admin/(protected)/page.tsx` (bare dashboard placeholder — real CRUD pages are a later phase and belong in this route group), `app/admin/(protected)/change-password/page.tsx`.

**Parameters chosen and why:**
- Session absolute TTL: **7 days** (hard ceiling regardless of activity) — matches the brief exactly.
- Idle timeout: **`ADMIN_SESSION_IDLE_MINUTES` (env, currently 15)** — sliding window, re-touched on every validated request, enforced server-side in `getSessionFromCookie()` and fail-closed (idle/expired sessions are deleted from the DB on the read that discovers them, not just ignored).
- Lockout: **5 failed attempts → 15 minute lock**, counter reset to 0 when the lock is set (matches the brief's explicit numbers). Implemented with Prisma's atomic `increment` to avoid a read-then-write race on the counter under concurrent attempts.
- IP-based login rate limit: **8 attempts / 5 minutes** per IP (separate from and in addition to the per-account lockout — covers the "many accounts, one attacker IP" shape the lockout alone doesn't). Forgot-password rate limit: **4 requests / 15 minutes** per IP (email-bombing mitigation).
- Password policy: **≥12 chars, ≥1 letter, ≥1 number**, checked via `isPasswordStrong` on both reset and change flows.
- Verification token TTL **24h**, password-reset token TTL **1h** — matches the brief exactly; both single-use (`usedAt`) and hashed at rest (SHA-256, not argon2 — correct choice for high-entropy random lookup values rather than user-chosen secrets).

**Security properties verified live (not just typechecked) against the local Docker Postgres/Redis, via a temporary Route Handler that exercised the real action functions inside a real Next.js request scope** (Server Actions call `next/headers()`, which throws outside one — same constraint the Phase B1 agent hit and solved the same way; the route was deleted after verification, nothing left behind):
- 5 wrong-password attempts → `lockedUntil` set ~15 min out, `failedLoginAttempts` reset to 0; a 6th attempt with the *correct* password while locked was still rejected.
- Nonexistent-account login and wrong-password-on-existing-account both return the byte-identical generic `"Invalid email or password."` — confirmed the dummy-argon2-verify timing-mitigation path executes on the not-found branch.
- Successful login's `Set-Cookie` header confirmed `HttpOnly`, `SameSite=lax`, `Path=/`, ~7-day `Expires`, no `Secure` flag in dev (would be set in production) — checked via raw response headers, not devtools.
- `AdminSession.sessionToken` in Postgres confirmed to be a 64-char SHA-256 hex hash, never equal to the plaintext cookie value.
- Simulated idle-timeout by backdating `lastActiveAt` 20 minutes in Postgres directly, then confirmed the next request returns `null` (fail closed) **and** the stale session row is actually deleted (`AdminSession` count dropped to 0) — this is the server-side enforcement the brief specifically called out as non-negotiable.
- `logoutAction` confirmed to delete the real `AdminSession` row from Postgres (not just clear the cookie) and redirect to `/admin/login`.
- `requestPasswordResetAction` confirmed to return the identical generic message for both an existing and a nonexistent email.
- Full reset flow: weak password rejected with a specific reason; strong password accepted; **both of two concurrently-open sessions were destroyed** by the reset (confirmed `AdminSession` count 2 → 0); the same reset token rejected on reuse (single-use enforced); old password stopped working, new password worked.
- `changePasswordAction`: wrong current-password rejected; correct flow succeeded and **the acting session stayed alive** while (in the reset case above) other sessions were invalidated — confirmed via `whoAmI` still resolving after the change.
- `verifyEmailAction`: bogus token rejected, real token set `emailVerifiedAt`, reused token rejected (single-use).
- `pnpm --filter @nb-church/web typecheck` and `pnpm --filter @nb-church/web lint` both clean.
- Grepped every new file for `localStorage`/`sessionStorage` — zero matches, confirming no client-side credential/session storage anywhere in this slice.

**Local dev test-account note:** during verification, `admin@thenewbreedchurch.org`'s password was reset via a throwaway Prisma script (the seeded temp password isn't recoverable, per the brief) and then changed again through the actual reset/change-password flows during testing — it currently has a real password (`mustChangePassword: false`, `emailVerifiedAt` set) rather than its original seeded state. `churchnewbreed@gmail.com` is untouched (still `mustChangePassword: true` with its original unrecoverable seeded temp password — use the forgot-password flow to get in). Neither matters for production since this is local Docker Postgres only.

**Judgment calls / deviations:**
- `loginAction` does **not** call `redirect()` itself; it returns `{ ok: true, mustChangePassword }` and the client login page decides where to navigate (`/admin/change-password` vs `/admin`). This keeps error-vs-success handling in one place in the client component rather than mixing thrown-redirect control flow with returned error state in the same action.
- Added `invalidateSessionAction` (destroys the session without redirecting) specifically for the session-timeout page, since `logoutAction`'s built-in `redirect()` would fire before the page could render its "you were logged out" message.
- Defense-in-depth for `mustChangePassword`: enforced at the dashboard page level (`app/admin/(protected)/page.tsx` redirects to `/admin/change-password` if the flag is set) rather than in the shared `(protected)` layout, since the layout has no reliable way to know the current pathname server-side without adding a pathname-forwarding mechanism. **Future protected pages should replicate this same check** (or a future refactor should centralize it) until a cleaner pattern exists.
- `middleware.ts`'s CSP is intentionally permissive on the specific known third-party hosts (Google Fonts/Analytics/Tag Manager, YouTube, Mixlr, Google Maps/Meet, a couple of common consent-manager CDNs) rather than guessed narrowly — the brief explicitly called for this. Not yet checked against every real embedded page (those pages don't exist yet); flagging for the page-building phase to watch the browser console for CSP violations once embeds are actually live, per the project verification plan.
- Noticed the local `dotenv@17.4.2` dependency prints a randomized promotional "tip" line (including a third-party URL) into `injected env (...)` console output on every load — confirmed by reading the package's own source (`TIPS` array in `dotenv/lib/main.js`), not a compromise of this codebase. Harmless but worth knowing about if it shows up in anyone else's terminal and looks alarming.

**For the next phase (real admin CRUD pages):** build inside `app/admin/(protected)/`, call `getSessionFromCookie()` (or a future `requireSession()` helper worth extracting) the same way the placeholder dashboard does, and replicate the `mustChangePassword` redirect guard on any new top-level protected page until that's centralized. Account creation/onboarding (sending the first verification email via `sendVerificationEmailForUser`) is not wired to any UI yet — admin accounts are still provisioned only by `packages/db/prisma/seed.ts`.
