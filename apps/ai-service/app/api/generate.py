from fastapi import APIRouter, HTTPException
from app.core.config import settings
from app.models.schemas import GenerateRequest, GenerateResponse, extract_key_findings
from app.embeddings.service import generate_embedding
from app.rag.pinecone_service import get_namespace_for_specialty
from app.retrieval.service import hybrid_retrieval
from app.citations.service import extract_citations, format_context_with_citations
from openai import AsyncOpenAI
from app.prompts.medical_prompt import MEDICAL_AI_PROMPT
from app.retrieval.service import calculate_confidence

router = APIRouter()
client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

@router.post("/", response_model=GenerateResponse)
async def generate_response(request: GenerateRequest):
    """Generate medical response using RAG pipeline."""
    try:
        # Retrieve context
        chunks = await hybrid_retrieval(
            query=request.query,
            topK=request.topK,
            specialty=request.specialty
        )
        
        if not chunks:
            return GenerateResponse(
                summary="Insufficient evidence to provide a complete answer. Please provide more specific medical terms or consult medical literature.",
                keyFindings=[],
                citations=[],
                confidenceScore=0.0,
                status="insufficient"
            )
        
        # Format context
        context = format_context_with_citations(chunks)
        
        # Generate response with GPT
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
        
        # Extract key findings from the response
        key_findings = extract_key_findings(raw_content)
        
        # If no key findings found, create them from content
        if not key_findings and raw_content:
            sentences = [s.strip() for s in raw_content.split('.') if s.strip() and len(s.strip()) > 20]
            key_findings = sentences[:5]
        
        # Extract citations
        citations = extract_citations(chunks)
        
        # Calculate confidence
        confidence = calculate_confidence(chunks, len(citations))
        
        return GenerateResponse(
            summary=raw_content,
            keyFindings=key_findings,
            citations=citations,
            confidenceScore=confidence,
            status="pending"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")