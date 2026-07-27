#!/bin/sh
# Runs pending Prisma migrations before the app starts serving traffic.
# Used by both the dev and runner Docker stages so `docker compose up` and
# the production container always leave the schema up to date automatically
# (see HANDOFF.md "Migrations" for why this isn't also done at Vercel
# cold-start — there it runs once at build time instead).
set -e

echo "[entrypoint] applying pending Prisma migrations..."
if [ -f "pnpm-workspace.yaml" ]; then
  # dev stage: full workspace present
  pnpm --filter @nb-church/db exec prisma migrate deploy --schema=packages/db/prisma/schema.prisma
else
  # runner stage: standalone output, no workspace context — prisma is
  # installed globally there instead (see Dockerfile's runner stage)
  prisma migrate deploy --schema=packages/db/prisma/schema.prisma
fi

echo "[entrypoint] migrations up to date, starting app..."
exec "$@"
