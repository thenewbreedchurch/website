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
# next.config.ts computes the R2 remotePatterns entry from R2_PUBLIC_URL at
# `next build` time (it needs to know the hostname to allow-list before the
# config is compiled into the build output) — Render only forwards a
# dashboard env var into the Docker build step for vars the Dockerfile
# explicitly declares with ARG, same as DATABASE_URL above. Without this,
# every R2-uploaded image 400s from /_next/image in production
# ("url" parameter is not allowed) even though the image itself is public
# and the env var is set correctly in Render's dashboard — confirmed live.
ARG R2_PUBLIC_URL
ENV R2_PUBLIC_URL=$R2_PUBLIC_URL
COPY pnpm-workspace.yaml package.json ./
COPY apps/web/package.json apps/web/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/config/package.json packages/config/package.json
RUN pnpm install --frozen-lockfile=false
COPY . .
RUN pnpm --filter @nb-church/db generate
RUN pnpm --filter @nb-church/web build
# sharp is required by Next's built-in image optimizer AND by
# actions/admin/upload.ts (real admin image uploads) for self-hosted
# deployments (see next.config.ts). Two distinct failure modes have bitten
# this exact spot before: (1) sharp silently dropped from the traced
# standalone output entirely (same class of bug that hit the prisma CLI in
# this Dockerfile — see git log "Fix Dockerfile runner stage: copy prisma
# CLI"), and (2) a real pnpm bug where `pnpm install` silently produces an
# incomplete @img/sharp-libvips-<platform>@1.3.2 package (present, but
# missing its actual compiled libvips-cpp.so binary — confirmed via direct
# repro: a plain `tar xzf` of the exact same npm tarball extracts it fine,
# pnpm's own extraction does not), which crashed real sermon
# creates/uploads in production even though this same directory-presence
# check passed. package.json now pins `sharp` to the known-good 0.34.5
# (whose libvips companion, @img/sharp-libvips-*@1.2.4, has never shown
# this failure across repeated arm64 and amd64 rebuilds) rather than the
# floating ^0.35.x range — do not loosen that pin without re-verifying a
# real image upload against a real container build, not just this file
# check. This assertion checks for the actual .so/.node binary, not just a
# directory, so a regression of either failure mode fails the build loudly
# instead of shipping a runner image where uploads 500 in production.
RUN find /app/apps/web/.next/standalone -iname "libvips-cpp.so*" -o -iname "libvips-cpp*.dylib" | grep -q . \
  || (echo "ERROR: sharp's native libvips binary was not traced into apps/web/.next/standalone — image optimization and admin image uploads will be broken in the runner image." && exit 1)
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
