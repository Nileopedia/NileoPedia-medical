# NileoPedia-medical
AI-powered medical knowledge platform using RAG, Groq Llama-3.3, Pinecone, and Elasticsearch to deliver evidence-based, source-grounded clinical information with citation-backed responses.

## Production Deployment

### Prerequisites
- Docker and Docker Compose
- Environment variables configured (see `.env.example`)

### Setup

1. Copy the environment template:
```bash
cp .env.example .env
```

2. Fill in your values in `.env`:
- `POSTGRES_PASSWORD` - PostgreSQL password
- `GROQ_API_KEY` - Groq API key
- `HF_API_KEY` - Hugging Face API key (for embeddings)
- `PINECONE_API_KEY` - Pinecone API key
- `PINECONE_ENVIRONMENT` - Pinecone environment (default: us-east-1)
- `PINECONE_INDEX_NAME` - Pinecone index name (default: nileopedia-medical)
- `ELASTICSEARCH_URL` - Elasticsearch cloud URL (optional, for keyword search)
- `ELASTICSEARCH_API_KEY` - Elasticsearch API key (optional)

### Deploy

```bash
docker-compose up -d --build
```

Or with explicit env file:
```bash
docker-compose --env-file .env up -d --build
```

### Initialize Pinecone with Sample Data

After deployment, ingest sample medical documents to populate the vector database:

```bash
# Run the init profile to seed Pinecone with sample documents
docker-compose --profile init run --rm pinecone-init
```

Or manually via API:
```bash
curl -X POST http://localhost:8000/ingest/ \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Your Document Title",
    "content": "Your medical document content here...",
    "specialty": "cardiology",
    "documentType": "guideline",
    "source": "Medical Journal 2024",
    "publicationYear": 2024
  }'
```

### Services

| Service | Port | Description |
|---------|------|-------------|
| nginx | 80 | Reverse proxy (frontend, backend, ai-service) |
| frontend | 3000 | Next.js application |
| backend | 3001 | Express API server |
| ai-service | 8000 | FastAPI service for AI processing |
| postgres | 5432 | PostgreSQL database |
| redis | 6379 | Redis cache |