from fastapi import APIRouter, HTTPException
from app.models.schemas import IngestRequest, IngestResponse
from app.chunking.service import semantic_chunk
from app.embeddings.service import generate_embedding, generate_batch_embeddings
from app.rag.pinecone_service import upsert_vectors, get_namespace_for_specialty
from app.rag.elasticsearch_service import index_document
import uuid

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
        
        # Prepare embeddings
        texts = [chunk.text for chunk in chunks]
        embeddings = await generate_batch_embeddings(texts)
        
        # Upsert to Pinecone
        namespace = get_namespace_for_specialty(request.specialty)
        vectors = [
            (
                f"{document_id}-chunk-{i}",
                emb,
                {
                    "documentId": document_id,
                    "text": chunk.text,
                    "source": request.title,
                    "specialty": request.specialty or "general",
                }
            )
            for i, (chunk, emb) in enumerate(zip(chunks, embeddings))
        ]
        await upsert_vectors(vectors)
        
        # Index in Elasticsearch
        await index_document(document_id, {
            "title": request.title,
            "content": content[:10000],  # First 10k chars
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
        raise HTTPException(status_code=500, detail=f"Ingestion failed: {str(e)}")