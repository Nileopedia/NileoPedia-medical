#!/bin/bash

# NileoPedia Setup Script
# This script sets up and runs all services

echo "Setting up NileoPedia services..."

# 1. Set required environment variables
export GROQ_API_KEY="${GROQ_API_KEY:-}"
export HF_API_KEY="${HF_API_KEY:-}"
export PINECONE_API_KEY="${PINECONE_API_KEY:-}"
export PINECONE_ENVIRONMENT="${PINECONE_ENVIRONMENT:-us-east-1-aws}"

# 2. Build and start services
echo "Building and starting Docker services..."
docker-compose up -d postgres redis

echo "Waiting for PostgreSQL..."
sleep 10

# 3. Run migrations
echo "Running database migrations..."
cd apps/backend
npx prisma migrate deploy

# 4. Seed database
echo "Seeding database..."
npx ts-node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function seed() {
  const users = [
    { email: 'admin@nileopedia.test', fullName: 'Admin User', role: 'ADMIN', password: '\$2a\$10\$hashedpasswordhere' },
    { email: 'validator@nileopedia.test', fullName: 'Medical Validator', role: 'VALIDATOR', password: '\$2a\$10\$hashedpasswordhere' },
    { email: 'user@nileopedia.test', fullName: 'Medical User', role: 'MEDICAL_USER', password: '\$2a\$10\$hashedpasswordhere' }
  ];
  for (const u of users) {
    await prisma.user.upsert({ where: { email: u.email }, update: {}, create: u });
  }
  await prisma.\$disconnect();
}
seed();
"

cd ../..

echo "Services ready. To start AI service and backend, run:"
echo "  docker-compose up -d ai-service backend"

# To test endpoints after setting GROQ_API_KEY and HF_API_KEY:
# curl -X POST http://localhost:8000/ingest -d '{"title":"WHO Hypertension Guidelines 2025","content":"<medical content>"}'
# curl -X POST http://localhost:8000/generate -d '{"query":"What are the latest WHO hypertension guidelines?"}'