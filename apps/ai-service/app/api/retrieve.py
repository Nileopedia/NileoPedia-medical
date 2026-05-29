from fastapi import APIRouter, HTTPException
from app.models.schemas import SearchRequest, RetrievalResponse, RetrievalType
from app.retrieval.service import hybrid_retrieval

router = APIRouter()

@router.post("/", response_model=RetrievalResponse)
async def retrieve_documents(request: SearchRequest):
    """Retrieve documents using hybrid search."""
    try:
        chunks = await hybrid_retrieval(
            query=request.query,
            topK=request.topK,
            specialty=request.specialty,
            retrieval_type=request.type
        )
        
        return RetrievalResponse(
            query=request.query,
            results=chunks,
            searchType=request.type.value
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Retrieval failed: {str(e)}")

@router.post("/semantic")
async def semantic_retrieval(request: SearchRequest):
    """Perform semantic-only retrieval."""
    request.type = RetrievalType.SEMANTIC
    return await retrieve_documents(request)

@router.post("/keyword")
async def keyword_retrieval(request: SearchRequest):
    """Perform keyword-only retrieval."""
    request.type = RetrievalType.KEYWORD
    return await retrieve_documents(request)