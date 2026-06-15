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

# Groq (for AI generation)
GROQ_API_KEY="gsk-..."
GROQ_MODEL="llama-3.3-70b-versatile"

# Hugging Face (for embeddings)
HF_API_KEY="hf-..."
HF_EMBEDDING_MODEL="sentence-transformers/all-MiniLM-L6-v2"

# Pinecone (vector database)
PINECONE_API_KEY="pcsk-..."
PINECONE_INDEX_NAME="nileopedia-medical"
PINECONE_ENVIRONMENT="us-east-1"

# Elasticsearch (retrieval) - REQUIRED (no localhost fallback)
ELASTICSEARCH_URL="https://your-elasticsearch-project.es.region.cloud.es.io:443"
ELASTICSEARCH_API_KEY="your-elasticsearch-api-key"

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

### Groq

1. Create account at console.groq.com
2. Generate API key
3. Set `GROQ_API_KEY` in backend `.env`

### Hugging Face (for embeddings)

1. Create account at huggingface.co
2. Generate API key from Settings > Access Tokens
3. Set `HF_API_KEY` in backend `.env`
4. Recreate Pinecone index with **384 dimensions** (MiniLM embedding size)

### Pinecone

1. Create account at pinecone.io
2. Create index named `nileopedia-medical` with 384 dimensions
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
```

**Note:** OTP verification for validators and admins uses mock OTP (accepts any 6-digit code) in development. Production requires email provider configuration.

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

## OTP/Email Verification

The system implements role-based OTP verification:

- **Medical Users** - No OTP required, direct login
- **Validators/Admins** - OTP required after registration/login

### API Endpoints

- `POST /auth/verify` - Check if email requires OTP verification
- `POST /auth/verify-otp` - Verify OTP code and get auth tokens

### Frontend Flow

1. Register/Login → Backend checks role
2. If validator/admin → Redirect to `/verify` page
3. Enter 6-digit code (any 6 digits in demo mode)
4. Receive tokens and access appropriate dashboard

## Forgot/Reset Password

Password reset functionality allows users to reset their password via email token.

### API Endpoints

- `POST /auth/forgot-password` - Request password reset (sends email with token)
- `POST /auth/reset-password` - Reset password with token

### Frontend Flow

1. Navigate to `/forgot-password`
2. Enter email address
3. Receive reset token (logged in backend for demo)
4. Navigate to `/reset-password?email=...&token=...`
5. Enter new password
6. Password updated, redirect to login

**Note:** In production, reset tokens are sent via email. Test mode logs tokens to server console.

## Save/Unsave Responses

Users can save AI responses for later reference.

### Database Changes

Run migration to add `isSaved` field to Question model:

```bash
cd apps/backend
npx prisma migrate dev --name add_isSaved_to_question
```

### API Endpoints

- `POST /questions/{id}/save` - Save a response (sets `isSaved=true`)
- `DELETE /questions/{id}/save` - Unsave a response (sets `isSaved=false`)

### Frontend Flow

1. View AI response in `/ask` page or `/history`
2. Click bookmark icon to save/unsave
3. Saved responses appear on `/saved` page
4. Backend persists `isSaved` status in database

## Elasticsearch

Elasticsearch is **required** for keyword search functionality. There is no localhost fallback - the service will fail to start without proper configuration.

### Configuration Requirements

Both environment variables must be set:

```bash
ELASTICSEARCH_URL=https://your-elasticsearch-project.es.region.cloud.es.io:443
ELASTICSEARCH_API_KEY=your_elasticsearch_api_key_here
```

### Test Elasticsearch Connectivity

```bash
cd apps/ai-service
pip install -r requirements.txt
python scripts/test_elasticsearch.py
```

The test script validates:
1. Configuration variables are set
2. Client initializes correctly
3. Connection to Elasticsearch cluster works

### Error Handling

- **Missing configuration**: App fails to start with clear error message
- **Connection failure**: Keyword search raises `RuntimeError`, hybrid search falls back to semantic-only
- **API errors**: All errors logged with descriptive messages