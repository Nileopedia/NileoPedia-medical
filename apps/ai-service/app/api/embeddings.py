from fastapi import APIRouter, HTTPException
from app.models.schemas import EmbeddingRequest
from app.embeddings.service import generate_embedding, generate_batch_embeddings

router = APIRouter()

@router.post("/generate")
async def create_embedding(request: EmbeddingRequest):
    """Generate embedding for text."""
    try:
        embedding = await generate_embedding(request)
        return {"embedding": embedding, "dimensions": len(embedding)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Embedding generation failed: {str(e)}")

@router.post("/batch")
async def create_batch_embeddings(texts: list[str]):
    """Generate embeddings for multiple texts."""
    try:
        embeddings = await generate_batch_embeddings(texts)
        return {"embeddings": embeddings, "dimensions": len(embeddings[0]) if embeddings else 0}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch embedding failed: {str(e)}")