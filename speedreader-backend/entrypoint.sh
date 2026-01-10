#!/bin/sh
set -e

echo "🔄 Waiting for database to be ready..."

# Wait for PostgreSQL to be available
until echo "SELECT 1" | npx prisma db execute --stdin > /dev/null 2>&1; do
  echo "⏳ Database is unavailable - sleeping..."
  sleep 2
done

echo "✅ Database is ready!"

echo "🔄 Running database migrations..."
npx prisma db push --accept-data-loss

echo "✅ Migrations complete!"

echo "🚀 Starting application..."
exec "$@"
