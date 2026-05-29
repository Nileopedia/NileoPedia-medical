import pytest
import asyncio
import sys
sys.path.insert(0, '/app')

# Mock external services for testing
from unittest.mock import AsyncMock, MagicMock, patch

@pytest.mark.asyncio
async def test_health_endpoint():
    from main import app
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

@pytest.mark.asyncio
async def test_embedding_endpoint_structure():
    """Test embedding endpoint request validation."""
    from app.models.schemas import EmbeddingRequest
    
    valid_request = EmbeddingRequest(text="test medical query")
    assert valid_request.text == "test medical query"
    assert valid_request.model == "text-embedding-3-large"

@pytest.mark.asyncio
async def test_search_request_validation():
    """Test search request schema."""
    from app.models.schemas import SearchRequest, RetrievalType
    
    req = SearchRequest(query="diabetes treatment")
    assert req.query == "diabetes treatment"
    assert req.topK == 10
    assert req.type == RetrievalType.HYBRID

@pytest.mark.asyncio
async def test_medical_prompt_exists():
    """Test medical prompt is defined."""
    from app.prompts.medical_prompt import MEDICAL_AI_PROMPT
    
    assert "NileoPedia Medical AI" in MEDICAL_AI_PROMPT
    assert "ONLY the provided context" in MEDICAL_AI_PROMPT
    assert "Never provide diagnosis" in MEDICAL_AI_PROMPT