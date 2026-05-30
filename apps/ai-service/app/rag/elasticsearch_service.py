from elasticsearch import AsyncElasticsearch
from app.models.schemas import DocumentChunk
from typing import Optional
import os
import logging

logger = logging.getLogger(__name__)

ELASTICSEARCH_URL = os.getenv("ELASTICSEARCH_URL", "")
ELASTICSEARCH_API_KEY = os.getenv("ELASTICSEARCH_API_KEY", "")

es = AsyncElasticsearch(
    ELASTICSEARCH_URL if ELASTICSEARCH_URL else "http://localhost:9200",
    api_key=ELASTICSEARCH_API_KEY if ELASTICSEARCH_API_KEY else None,
) if ELASTICSEARCH_URL else None

async def keyword_search(query: str, topK: int = 10, specialty: str = None) -> list[DocumentChunk]:
    """Perform keyword search in Elasticsearch."""
    if es is None:
        logger.warning("Elasticsearch not configured - returning empty results")
        return []
    
    body = {
        "query": {
            "bool": {
                "must": [
                    {"multi_match": {
                        "query": query,
                        "fields": ["title^2", "content", "abstract^1.5", "keywords"],
                        "type": "best_fields"
                    }}
                ]
            }
        },
        "size": topK
    }

    if specialty:
        body["query"]["bool"]["filter"] = [
            {"term": {"specialty.keyword": specialty.lower()}}
        ]

    try:
        response = await es.search(index="medical_documents", body=body)
        
        chunks = []
        for hit in response["hits"]["hits"]:
            source = hit["_source"]
            chunks.append(DocumentChunk(
                id=hit["_id"],
                text=source.get("content", "")[:2000],
                metadata={
                    "source": source.get("source", ""),
                    "specialty": source.get("specialty", ""),
                    "title": source.get("title", ""),
                    "publicationYear": source.get("publicationYear"),
                },
                score=hit["_score"] / 100.0
            ))
        logger.info(f"Elasticsearch keyword search returned {len(chunks)} results")
        return chunks
    except Exception as e:
        logger.error(f"Elasticsearch search failed: {str(e)}")
        return []

async def index_document(doc_id: str, document: dict) -> None:
    """Index document in Elasticsearch."""
    if es is None:
        return
    try:
        await es.index(index="medical_documents", id=doc_id, document=document)
        logger.info(f"Indexed document {doc_id} in Elasticsearch")
    except Exception as e:
        logger.error(f"Elasticsearch indexing failed: {str(e)}")
        raise

async def search_citations(query: str, topK: int = 10) -> list[DocumentChunk]:
    """Search for citations by medical terms."""
    if es is None:
        return []
    
    body = {
        "query": {
            "multi_match": {
                "query": query,
                "fields": ["title^3", "authors", "doi", "content"],
                "type": "best_fields"
            }
        },
        "size": topK
    }
    try:
        response = await es.search(index="citations", body=body)
        
        chunks = []
        for hit in response["hits"]["hits"]:
            source = hit["_source"]
            chunks.append(DocumentChunk(
                id=hit["_id"],
                text=source.get("content", "")[:1000],
                metadata={
                    "title": source.get("title", ""),
                    "source": source.get("source", ""),
                    "authors": source.get("authors", ""),
                    "doi": source.get("doi", ""),
                },
                score=hit["_score"] / 100.0
            ))
        return chunks
    except Exception as e:
        logger.error(f"Elasticsearch citation search failed: {str(e)}")
        return []