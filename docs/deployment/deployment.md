# Deployment Guide

## Environment Variables

### Backend (`.env`)

```env
# Server
PORT=3001
NODE_ENV="development"

# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/nileopedia"

# Redis (for BullMQ queue)
REDIS_URL="redis://localhost:6379"

# OpenAI (for AI generation)
OPENAI_API_KEY="sk-..."
OPENAI_MODEL="gpt-4o"

# Pinecone (vector database)
PINECONE_API_KEY="pcsk-..."
PINECONE_INDEX_NAME="nileopedia-medical"
PINECONE_ENVIRONMENT="us-east-1"

# Elasticsearch (retrieval)
ELASTICSEARCH_URL="http://localhost:9200"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:3001/api/v1/auth/google/callback"

# JWT
JWT_ACCESS_SECRET="your-jwt-access-secret-key"
JWT_REFRESH_SECRET="your-jwt-refresh-secret-key"

# Email (Resend)
EMAIL_PROVIDER="resend"
RESEND_API_KEY="your-resend-api-key"
EMAIL_FROM="noreply@nileopedia.com"

# CORS
CORS_ORIGIN="http://localhost:3000"
FRONTEND_URL="http://localhost:3000"

# AI Service
AI_SERVICE_URL="http://localhost:8000"
```

### Frontend (`apps/frontend/.env`)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

## Service Setup

### PostgreSQL

```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Create database
sudo -u postgres psql
CREATE DATABASE nileopedia;
CREATE USER nileopedia WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE nileopedia TO nileopedia;

# Run migrations
cd apps/backend
npm run prisma:migrate
```

### Redis

```bash
# Install Redis
sudo apt install redis-server

# Start service
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Verify
redis-cli ping
```

### OpenAI

1. Create account at platform.openai.com
2. Generate API key with billing enabled
3. Set `OPENAI_API_KEY` in backend `.env`

### Pinecone

1. Create account at pinecone.io
2. Create index named `nileopedia-medical`
3. Get API key and set in backend `.env`

### Google OAuth

1. Go to Google Cloud Console
2. Create OAuth 2.0 credentials
3. Add authorized redirect URI: `http://localhost:3001/api/v1/auth/google/callback`
4. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in backend `.env`

### Email Provider

1. Sign up at resend.com
2. Get API key
3. Set `RESEND_API_KEY` in backend `.env`

## Development

```bash
# Install dependencies
npm install

# Start all services
docker-compose up -d

# Run backend
npm run dev --workspace=apps/backend

# Run AI service
cd apps/ai-service && python -m uvicorn main:app --reload --port 8000

# Run frontend
npm run dev --workspace=apps/frontend
```

## Production

```bash
# Build
npm run build

# Start backend
cd apps/backend && npm run start

# Start AI service
cd apps/ai-service && python -m uvicorn main:app --host 0.0.0.0 --port 8000
```