from app.core.pinecone_client import index
from app.models.schemas import DocumentChunk
from typing import Optional
import logging

logger = logging.getLogger(__name__)

async def semantic_search(query_embedding: list[float], topK: int = 10, namespace: str = None) -> list[DocumentChunk]:
    """Perform semantic search in Pinecone."""
    if index is None:
        logger.warning("Pinecone index not configured - returning empty results")
        return []
    
    if namespace is None:
        namespace = "general"

    try:
        results = index.query(
            vector=query_embedding,
            top_k=topK,
            namespace=namespace,
            include_metadata=True
        )
        
        chunks = []
        for match in results.matches:
            metadata = match.metadata or {}
            chunks.append(DocumentChunk(
                id=match.id,
                text=metadata.get("chunk_text", "")[:2000],
                metadata={
                    "source": metadata.get("source", ""),
                    "specialty": metadata.get("specialty", ""),
                    "title": metadata.get("title", ""),
                    "documentId": metadata.get("document_id", ""),
                    "publicationYear": metadata.get("publication_year"),
                },
                score=match.score
            ))
        logger.info(f"Pinecone semantic search returned {len(chunks)} results from namespace {namespace}")
        return chunks
    except Exception as e:
        logger.error(f"Pinecone query failed: {str(e)}")
        return []

async def upsert_vectors(vectors: list[tuple[str, list[float], dict]]) -> None:
    """Upsert vectors to Pinecone."""
    if index is None:
        logger.warning("Pinecone index not configured - skipping upsert")
        return
    
    try:
        index.upsert(vectors=vectors)
        logger.info(f"Successfully upserted {len(vectors)} vectors to Pinecone")
    except Exception as e:
        logger.error(f"Pinecone upsert failed: {str(e)}")
        raise

async def delete_vectors(ids: list[str]) -> None:
    """Delete vectors from Pinecone."""
    if index is None:
        return
    try:
        index.delete(ids=ids)
    except Exception as e:
        logger.error(f"Pinecone delete failed: {str(e)}")
        raise

async def get_namespace_stats() -> dict:
    """Get Pinecone index statistics."""
    if index is None:
        return {"error": "Pinecone not configured"}
    try:
        return index.describe_index_stats()
    except Exception as e:
        logger.error(f"Pinecone stats failed: {str(e)}")
        return {"error": str(e)}

def get_namespace_for_specialty(specialty: str) -> str:
    """Map specialty to Pinecone namespace."""
    namespace_map = {
        "cardiology": "cardiology",
        "endocrinology": "endocrinology",
        "oncology": "oncology",
        "neurology": "neurology",
        "gastroenterology": "gastroenterology",
    }
    return namespace_map.get(specialty.lower(), "general")