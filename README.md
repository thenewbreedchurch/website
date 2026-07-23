# The New Breed Church — Website

Full-stack rebuild of thenewbreedchurch.org: Next.js (App Router, TypeScript), Postgres via Prisma, Redis caching, and a custom admin panel so church staff can edit all content without a redeploy.

The previous static HTML/CSS/JS site (and its separate Express backend) is preserved for reference in [`_legacy-static-site/`](./_legacy-static-site) — nothing there is served in production anymore.

## Stack

- **Framework**: Next.js 16 (App Router, TypeScript, React 19)
- **Styling**: Tailwind CSS v4 + shadcn/ui (Radix primitives)
- **Motion**: Framer Motion (scroll parallax/tilt) + GSAP/ScrollTrigger (cinematic sequences)
- **Database**: PostgreSQL via Prisma ORM (`packages/db`)
- **Cache / rate limiting**: Redis (local Docker) / Upstash (production)
- **Email**: Resend + React Email
- **Auth**: NextAuth (Auth.js) magic-link, admin-allowlist gated
- **Hosting**: Vercel (app) + Neon (Postgres) + Upstash (Redis) + Resend (email)

## Prerequisites

- Node.js 20+
- pnpm (`npm install -g pnpm`)
- Docker Desktop (for local Postgres/Redis/pgAdmin)

## Local setup (Docker — recommended)

```bash
cp .env.example .env        # fill in real values (or keep local Docker defaults)
pnpm install
docker compose up -d        # postgres, pgadmin, redis, web
```

- App: http://localhost:3000
- pgAdmin: http://localhost:5050 (login with `PGADMIN_DEFAULT_EMAIL`/`PGADMIN_DEFAULT_PASSWORD` from `.env`; the `nbchurch` server is pre-registered)
- Migrations run automatically on container start (`scripts/entrypoint.sh`) — no manual `migrate deploy` step needed.

To seed real starter content (service times, giving accounts, church settings — ported from the legacy site):

```bash
pnpm db:seed
```

## Local setup (without Docker)

```bash
cp .env.example .env        # point DATABASE_URL/REDIS_URL at your own local instances
pnpm install
pnpm db:migrate:dev
pnpm db:seed
pnpm dev
```

## Project structure

```
apps/web/           Next.js app — pages, components, Server Actions, admin panel
packages/db/         Prisma schema, migrations, seed script, shared client singleton
packages/config/      Shared tsconfig preset
scripts/               Image pipeline, legacy-data migration, Docker entrypoint
_legacy-static-site/    The old static site, kept for reference only
```

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Start the Next.js dev server |
| `pnpm build` | Generate Prisma client + production build |
| `pnpm db:migrate:dev` | Create/apply a migration locally (interactive) |
| `pnpm db:migrate` | Apply pending migrations non-interactively (`migrate deploy`) |
| `pnpm db:seed` | Seed real starter content |
| `pnpm db:studio` | Open Prisma Studio |
| `pnpm lint` / `pnpm typecheck` / `pnpm test` | Run across all workspace packages |
| `pnpm docker:up` / `pnpm docker:down` | Start/stop the full local Docker stack |

## CI

`.github/workflows/ci.yml` runs typecheck, lint, tests, `prisma migrate diff --exit-code` (fails the build if the committed schema and migrations have drifted), and a production build on every PR.

## Documentation

See [`HANDOFF.md`](./HANDOFF.md) for account ownership, admin panel usage, secret rotation, and a running changelog of what's been done and what's still open.
