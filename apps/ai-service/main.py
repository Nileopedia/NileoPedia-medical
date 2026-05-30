from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import logging

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

app = FastAPI(
    title="NileoPedia AI Service",
    version="1.0.0",
    description="Medical AI RAG Engine with hybrid retrieval"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
async def health():
    return {"status": "ok", "service": "ai-service"}

# Include routers
from app.api import generate, embeddings, retrieve, ingest
app.include_router(generate.router, prefix="/generate", tags=["generate"])
app.include_router(embeddings.router, prefix="/embeddings", tags=["embeddings"])
app.include_router(retrieve.router, prefix="/retrieve", tags=["retrieve"])
app.include_router(ingest.router, prefix="/ingest", tags=["ingest"])