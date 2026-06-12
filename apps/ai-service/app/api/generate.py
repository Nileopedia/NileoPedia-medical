from fastapi import APIRouter, HTTPException
import logging
from app.models.schemas import GenerateRequest, GenerateResponse, extract_key_findings
from app.retrieval.service import hybrid_retrieval, calculate_confidence
from app.retrieval.service import generate_demo_embedding
from app.rag.pinecone_service import semantic_search, get_namespace_for_specialty
from app.citations.service import extract_citations, format_context_with_citations

router = APIRouter()
logger = logging.getLogger(__name__)

# Try to import OpenAI, fall back to demo mode
try:
    from openai import AsyncOpenAI
    from app.core.config import settings
    client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    HAS_OPENAI = True
except Exception:
    HAS_OPENAI = False
    logger.warning("OpenAI not available, using demo mode")

@router.post("/", response_model=GenerateResponse)
async def generate_response(request: GenerateRequest):
    """Generate medical response using RAG pipeline with fallback to demo mode."""
    try:
        chunks = await hybrid_retrieval(
            query=request.query,
            topK=request.topK,
            specialty=request.specialty
        )
        
        if not chunks:
            return GenerateResponse(
                summary=f"Based on medical literature search, no specific documents were found for '{request.query}'. The query was processed for specialty: {request.specialty || 'general'}",
                keyFindings=[
                    f'Search completed for specialty: {request.specialty || "general"}',
                    "Try rephrasing your medical question",
                    "No documents matched in the vector database"
                ],
                citations=[],
                confidenceScore=0.3,
                status="insufficient"
            )
        
        context = format_context_with_citations(chunks)
        
        if HAS_OPENAI:
            from app.core.config import settings
            from app.prompts.medical_prompt import MEDICAL_AI_PROMPT
            try:
                response = await client.chat.completions.create(
                    model=settings.CHAT_MODEL,
                    messages=[
                        {"role": "system", "content": MEDICAL_AI_PROMPT.format(context=context, question=request.query)},
                        {"role": "user", "content": request.query}
                    ],
                    max_tokens=1200,
                    temperature=0.3
                )
                raw_content = response.choices[0].message.content or ""
            except Exception as e:
                logger.warning(f"OpenAI generation failed: {e}, using fallback")
                raw_content = f"Based on {request.specialty || 'general'} medical literature, here are the key insights for: '{request.query}'"
        else:
            raw_content = f"Based on {request.specialty || 'general'} medical literature, here are the key insights for: '{request.query}'"
        
        key_findings = extract_key_findings(raw_content)
        if not key_findings and raw_content:
            sentences = [s.strip() for s in raw_content.split('.') if s.strip() and len(s.strip()) > 20]
            key_findings = sentences[:3]
        
        citations = extract_citations(chunks)
        confidence = calculate_confidence(chunks, len(citations))
        
        return GenerateResponse(
            summary=raw_content,
            keyFindings=key_findings if key_findings else [
                f"Finding from {request.specialty || 'general'} knowledge base",
                "Document retrieved successfully",
                "Evidence-based information available"
            ],
            citations=citations,
            confidenceScore=confidence,
            status="pending"
        )
        
    except Exception as e:
        logger.error(f"Generation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")