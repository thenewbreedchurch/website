# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /app

# ---------------------------------------------------------------------------
# dev: used by docker-compose for local development (bind-mounts source over
# this image, runs `next dev`; migrations are applied by ./scripts/entrypoint.sh)
# ---------------------------------------------------------------------------
FROM base AS dev
COPY pnpm-workspace.yaml package.json ./
COPY apps/web/package.json apps/web/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/config/package.json packages/config/package.json
RUN pnpm install --frozen-lockfile=false
COPY . .
COPY scripts/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
EXPOSE 3000
ENTRYPOINT ["/entrypoint.sh"]
CMD ["pnpm", "--filter", "@nb-church/web", "dev"]

# ---------------------------------------------------------------------------
# builder: production build
# ---------------------------------------------------------------------------
FROM base AS builder
# Several public pages (e.g. /about) are statically prerendered at build
# time and query Postgres directly (staff, service times, church settings)
# — next build fails without a reachable DATABASE_URL. Vercel injects this
# automatically for every build; Docker builds don't get runtime env vars
# unless passed explicitly, so it must come in as a build arg here.
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL
COPY pnpm-workspace.yaml package.json ./
COPY apps/web/package.json apps/web/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/config/package.json packages/config/package.json
RUN pnpm install --frozen-lockfile=false
COPY . .
RUN pnpm --filter @nb-church/db generate
RUN pnpm --filter @nb-church/web build

# ---------------------------------------------------------------------------
# runner: minimal production image (Next.js standalone output)
# ---------------------------------------------------------------------------
FROM base AS runner
ENV NODE_ENV=production
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/packages/db/generated ./packages/db/generated
COPY --from=builder /app/packages/db/prisma ./packages/db/prisma
# prisma/@prisma are devDependencies/dependencies of packages/db, not the
# workspace root, so pnpm only symlinks them under packages/db/node_modules
# — never at /app/node_modules directly. The prisma CLI's own .bin shim
# script hardcodes a relative path to a sibling ../prisma directory
# (see packages/db/node_modules/.bin/prisma), so both must land together
# at the runner's root node_modules for `prisma migrate deploy` to resolve.
COPY --from=builder /app/packages/db/node_modules/.bin/prisma ./node_modules/.bin/prisma
COPY --from=builder /app/packages/db/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/packages/db/node_modules/@prisma ./node_modules/@prisma
COPY scripts/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
EXPOSE 3000
ENTRYPOINT ["/entrypoint.sh"]
CMD ["node", "apps/web/server.js"]
