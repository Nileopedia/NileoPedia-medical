from elasticsearch import AsyncElasticsearch
from app.models.schemas import DocumentChunk
from typing import Optional
import os
import logging

logger = logging.getLogger(__name__)

ELASTICSEARCH_URL = os.getenv("ELASTICSEARCH_URL")
ELASTICSEARCH_API_KEY = os.getenv("ELASTICSEARCH_API_KEY", "")

es: Optional[AsyncElasticsearch] = None

def init_elasticsearch() -> AsyncElasticsearch:
    """Initialize Elasticsearch client. Raises error if not properly configured."""
    global es
    
    if not ELASTICSEARCH_URL:
        raise ValueError(
            "ELASTICSEARCH_URL environment variable is required. "
            "Set it to your Elasticsearch cloud endpoint (e.g., https://your-project.es.region.cloud.com:443)"
        )
    
    if not ELASTICSEARCH_API_KEY:
        raise ValueError(
            "ELASTICSEARCH_API_KEY environment variable is required for Elasticsearch authentication."
        )
    
    es = AsyncElasticsearch(
        ELASTICSEARCH_URL,
        api_key=ELASTICSEARCH_API_KEY,
        request_timeout=30,
    )
    logger.info(f"Elasticsearch client initialized with URL: {ELASTICSEARCH_URL[:50]}...")
    return es

def get_elasticsearch() -> AsyncElasticsearch:
    """Get Elasticsearch client, initializing if needed."""
    global es
    if es is None:
        try:
            es = init_elasticsearch()
        except ValueError as e:
            logger.error(str(e))
            raise
    return es

async def keyword_search(query: str, topK: int = 10, specialty: str = None) -> list[DocumentChunk]:
    """Perform keyword search in Elasticsearch."""
    try:
        es_client = get_elasticsearch()
    except (ValueError, Exception) as e:
        logger.error(f"Elasticsearch client not available: {str(e)}")
        raise RuntimeError(f"Elasticsearch connection failed: {str(e)}") from e
    
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
        response = await es_client.search(index="medical_documents", body=body)
        
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
        raise RuntimeError(f"Elasticsearch keyword search failed: {str(e)}") from e

async def index_document(doc_id: str, document: dict) -> None:
    """Index document in Elasticsearch."""
    try:
        es_client = get_elasticsearch()
    except (ValueError, Exception) as e:
        logger.error(f"Elasticsearch client not available: {str(e)}")
        raise RuntimeError(f"Elasticsearch connection failed: {str(e)}") from e
    try:
        await es_client.index(index="medical_documents", id=doc_id, document=document)
        logger.info(f"Indexed document {doc_id} in Elasticsearch")
    except Exception as e:
        logger.error(f"Elasticsearch indexing failed: {str(e)}")
        raise

async def search_citations(query: str, topK: int = 10) -> list[DocumentChunk]:
    """Search for citations by medical terms."""
    try:
        es_client = get_elasticsearch()
    except (ValueError, Exception) as e:
        logger.error(f"Elasticsearch client not available: {str(e)}")
        raise RuntimeError(f"Elasticsearch connection failed: {str(e)}") from e
    
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
        response = await es_client.search(index="citations", body=body)
        
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
        raise RuntimeError(f"Elasticsearch citation search failed: {str(e)}") from e