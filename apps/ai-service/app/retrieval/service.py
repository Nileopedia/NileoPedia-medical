from app.rag.pinecone_service import semantic_search, get_namespace_for_specialty
from app.rag.elasticsearch_service import keyword_search, search_citations
from app.embeddings.service import generate_embedding
from app.models.schemas import DocumentChunk, RetrievalType, EmbeddingRequest
from typing import List
import logging

logger = logging.getLogger(__name__)

async def hybrid_retrieval(
    query: str,
    topK: int = 10,
    specialty: str = None,
    retrieval_type: RetrievalType = RetrievalType.HYBRID
) -> List[DocumentChunk]:
    """Perform hybrid retrieval combining semantic and keyword search."""
    
    if retrieval_type == RetrievalType.SEMANTIC:
        embedding = await generate_embedding(EmbeddingRequest(text=query, model="text-embedding-3-large"))
        namespace = get_namespace_for_specialty(specialty) if specialty else "general"
        logger.info(f"Generated query embedding, searching in namespace: {namespace}")
        return await semantic_search(embedding, topK, namespace)
    
    elif retrieval_type == RetrievalType.KEYWORD:
        logger.info(f"Performing keyword search for: {query}")
        return await keyword_search(query, topK, specialty)
    
    else:  # HYBRID
        embedding = await generate_embedding(EmbeddingRequest(text=query, model="text-embedding-3-large"))
        namespace = get_namespace_for_specialty(specialty) if specialty else "general"
        
        logger.info(f"Performing hybrid search, namespace: {namespace}")
        semantic_chunks = await semantic_search(embedding, topK, namespace)
        keyword_chunks = await keyword_search(query, topK, specialty)
        
        logger.info(f"Semantic results: {len(semantic_chunks)}, Keyword results: {len(keyword_chunks)}")
        return _merge_results(semantic_chunks, keyword_chunks, topK)

async def _merge_results(
    semantic_chunks: List[DocumentChunk],
    keyword_chunks: List[DocumentChunk],
    topK: int
) -> List[DocumentChunk]:
    """Merge semantic and keyword results with weighted scoring."""
    merged_scores = {}
    
    # Normalize and weight semantic scores
    max_semantic = max((c.score for c in semantic_chunks), default=1.0)
    for chunk in semantic_chunks:
        normalized_score = chunk.score / max_semantic if max_semantic > 0 else 0
        weighted_score = normalized_score * settings.SEMANTIC_WEIGHT
        merged_scores[chunk.id] = {
            "chunk": chunk,
            "score": weighted_score,
            "seen": "semantic"
        }
    
    # Normalize and weight keyword scores
    max_keyword = max((c.score for c in keyword_chunks), default=1.0)
    for chunk in keyword_chunks:
        normalized_score = chunk.score / max_keyword if max_keyword > 0 else 0
        weighted_score = normalized_score * settings.KEYWORD_WEIGHT
        
        if chunk.id in merged_scores:
            merged_scores[chunk.id]["score"] += weighted_score
            merged_scores[chunk.id]["seen"] = "both"
        else:
            merged_scores[chunk.id] = {
                "chunk": chunk,
                "score": weighted_score,
                "seen": "keyword"
            }
    
    # Sort by combined score and return topK
    sorted_chunks = sorted(
        merged_scores.values(),
        key=lambda x: x["score"],
        reverse=True
    )[:topK]
    
    return [item["chunk"] for item in sorted_chunks]

def calculate_confidence(chunks: List[DocumentChunk], citation_density: int = None) -> float:
    """Calculate confidence score based on retrieval relevance and citation density."""
    if not chunks:
        return 0.0
    
    avg_score = sum(c.score for c in chunks) / len(chunks)
    
    if citation_density and len(chunks) > 0:
        density_factor = min(citation_density / len(chunks), 1.0)
        avg_score *= (0.7 + 0.3 * density_factor)
    
    return round(min(max(avg_score, 0.0), 1.0), 3)