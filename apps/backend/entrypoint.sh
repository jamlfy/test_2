#!/bin/sh
set -e

SCHEMA="packages/prisma/schema.prisma"
SEED_DIR="packages/prisma"

echo "Generating Prisma Client..."
npx prisma generate --schema=$SCHEMA

echo "Copying Prisma engine to dist..."
cp /app/node_modules/.prisma/client/libquery_engine-*.so.node /app/apps/backend/

echo "Pushing database schema..."
npx prisma db push --schema=$SCHEMA --accept-data-loss 2>&1

echo "Running seed..."
cd $SEED_DIR && npx prisma db seed 2>&1 || echo "Seed skipped or already applied"

cd /app

echo "Starting backend..."
exec "$@"
