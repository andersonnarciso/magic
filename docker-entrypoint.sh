#!/bin/sh

echo "Waiting for PostgreSQL to start..."
while ! nc -z db 5432; do
  sleep 1
done
echo "PostgreSQL started"

echo "Running database migrations..."
pnpm prisma migrate deploy

echo "Starting the application..."
pnpm dev
