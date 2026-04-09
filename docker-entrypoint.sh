#!/bin/sh
set -e

echo "→ Applying database migrations..."
echo "DATABASE_URL=$DATABASE_URL"
npx prisma migrate deploy

echo "→ Starting Next.js..."
exec node server.js