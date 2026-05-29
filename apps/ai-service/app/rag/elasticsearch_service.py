from elasticsearch import AsyncElasticsearch
from app.core.config import settings
from app.models.schemas import DocumentChunk
from typing import Optional

es = AsyncElasticsearch(settings.ELASTICSEARCH_URL)

async def keyword_search(query: str, topK: int = 10, specialty: str = None) -> list[DocumentChunk]:
    """Perform keyword search in Elasticsearch."""
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
            score=hit["_score"] / 100.0  # Normalize score
        ))
    return chunks

async def index_document(doc_id: str, document: dict) -> None:
    """Index document in Elasticsearch."""
    await es.index(index="medical_documents", id=doc_id, document=document)

async def search_citations(query: str, topK: int = 10) -> list[DocumentChunk]:
    """Search for citations by medical terms."""
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