#!/bin/bash

# Development setup script for participation app

echo "Setting up participation app for development..."

if ! docker info > /dev/null 2>&1; then
    echo "Docker is not running. Please start Docker and try again."
    exit 1
fi

echo "Starting PostgreSQL database..."
docker compose up -d postgres

echo "Waiting for database to be ready..."
until docker compose exec postgres pg_isready -U postgres > /dev/null 2>&1; do
    echo "Waiting for database..."
    sleep 2
done

echo "Database is ready!"

echo "Installing dependencies..."
npm install

echo "Generating Prisma client..."
npx prisma generate

echo "Running database migrations..."
npx prisma migrate dev --name init

echo "Seeding database..."
npx prisma db seed || echo "No seed script found, skipping..."

echo "Development setup complete!"
echo ""
echo "To start the development server:"
echo "  npm run dev"
echo ""
echo "To stop the database:"
echo "  docker compose down"
