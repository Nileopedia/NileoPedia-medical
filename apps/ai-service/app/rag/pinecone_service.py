from pinecone import Pinecone
from app.core.config import settings
from app.models.schemas import DocumentChunk
from typing import Optional

pc = Pinecone(api_key=settings.PINECONE_API_KEY)
index = pc.Index(settings.PINECONE_INDEX_NAME)

async def semantic_search(query_embedding: list[float], topK: int = 10, namespace: str = None) -> list[DocumentChunk]:
    """Perform semantic search in Pinecone."""
    if namespace is None:
        namespace = settings.PINECONE_NAMESPACE

    results = index.query(
        vector=query_embedding,
        top_k=topK,
        namespace=namespace,
        include_metadata=True
    )

    chunks = []
    for match in results.matches:
        chunks.append(DocumentChunk(
            id=match.id,
            text=match.metadata.get("text", "") if match.metadata else "",
            metadata={
                "source": match.metadata.get("source", "") if match.metadata else "",
                "specialty": match.metadata.get("specialty", "") if match.metadata else "",
                "documentId": match.metadata.get("documentId", "") if match.metadata else "",
            },
            score=match.score
        ))
    return chunks

async def upsert_vectors(vectors: list[tuple[str, list[float], dict]]) -> None:
    """Upsert vectors to Pinecone."""
    index.upsert(vectors=vectors)

async def delete_vectors(ids: list[str]) -> None:
    """Delete vectors from Pinecone."""
    index.delete(ids=ids)

async def get_namespace_stats() -> dict:
    """Get Pinecone index statistics."""
    return index.describe_index_stats()

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