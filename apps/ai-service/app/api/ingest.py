from fastapi import APIRouter, HTTPException
from app.models.schemas import IngestRequest, IngestResponse
from app.chunking.service import semantic_chunk
from app.embeddings.service import generate_batch_embeddings
from app.rag.pinecone_service import upsert_vectors, get_namespace_for_specialty
from app.rag.elasticsearch_service import index_document
import uuid
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/", response_model=IngestResponse)
async def ingest_document(request: IngestRequest):
    """Ingest document into the RAG pipeline."""
    try:
        document_id = str(uuid.uuid4())
        
        # Clean document
        content = request.content.strip()
        
        # Chunk document
        chunks = semantic_chunk(
            content,
            max_tokens=500,
            min_tokens=100,
            overlap=50,
            preserve_headings=True
        )
        
        if not chunks:
            raise HTTPException(status_code=400, detail="No valid chunks extracted from document")
        
        # Generate embeddings
        texts = [chunk.text for chunk in chunks]
        embeddings = await generate_batch_embeddings(texts)
        
        # Create vectors with metadata
        namespace = get_namespace_for_specialty(request.specialty)
        vectors = [
            (
                f"{document_id}-chunk-{i}",
                emb,
                {
                    "document_id": document_id,
                    "title": request.title,
                    "source": request.source or "internal",
                    "specialty": request.specialty or "general",
                    "chunk_text": chunk.text[:1000],
                    "publication_year": request.publicationYear or 2025,
                }
            )
            for i, (chunk, emb) in enumerate(zip(chunks, embeddings))
        ]
        
        # Store in Pinecone
        await upsert_vectors(vectors)
        logger.info(f"Successfully upserted {len(vectors)} vectors to Pinecone index")
        
        # Index in Elasticsearch (optional)
        await index_document(document_id, {
            "title": request.title,
            "content": content[:10000],
            "specialty": request.specialty,
            "documentType": request.documentType,
            "source": request.source,
            "publicationYear": request.publicationYear,
        })
        
        return IngestResponse(
            documentId=document_id,
            chunksProcessed=len(chunks),
            status="completed"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Document ingestion failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ingestion failed: {str(e)}")