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
RUN node -p "require('./packages/db/node_modules/prisma/package.json').version" > /prisma-version

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
# The prisma CLI (needed only for `prisma migrate deploy` at container
# start, see entrypoint.sh) isn't hoisted to the workspace root by pnpm —
# it's a devDependency of packages/db, isolated in pnpm's content-addressed
# store along with its own transitive deps (@prisma/engines, @prisma/config
# etc). Cherry-picking exact store paths for those proved fragile (they
# shift with any lockfile change). A plain global install of the exact
# same version that generated the client sidesteps pnpm's isolated
# node_modules entirely and is what the CLI is designed to support anyway.
COPY --from=builder /prisma-version /prisma-version
RUN npm install -g prisma@$(cat /prisma-version) && rm /prisma-version
COPY scripts/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
EXPOSE 3000
ENTRYPOINT ["/entrypoint.sh"]
CMD ["node", "apps/web/server.js"]
