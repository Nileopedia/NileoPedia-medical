from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum
import re

class RetrievalType(str, Enum):
    SEMANTIC = "semantic"
    KEYWORD = "keyword"
    HYBRID = "hybrid"

class SearchRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=1000)
    specialty: Optional[str] = None
    topK: int = Field(default=10, ge=1, le=100)
    type: RetrievalType = RetrievalType.HYBRID

class EmbeddingRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=30000)
    model: str = Field(default="text-embedding-3-large")

class DocumentChunk(BaseModel):
    id: str
    text: str
    metadata: dict
    score: float

class RetrievalResponse(BaseModel):
    query: str
    results: List[DocumentChunk]
    searchType: str

class Citation(BaseModel):
    title: str
    source: str
    authors: Optional[str] = None
    publicationYear: Optional[int] = None
    doi: Optional[str] = None
    url: Optional[str] = None
    pageNumber: Optional[int] = None
    sectionTitle: Optional[str] = None

class GenerateRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=2000)
    specialty: Optional[str] = None
    topK: int = Field(default=10, ge=1, le=50)

class GenerateResponse(BaseModel):
    summary: str
    keyFindings: List[str] = []
    citations: List[Citation]
    confidenceScore: float
    status: str = "pending"
    generatedBy: str = "GPT-4o"

class IngestRequest(BaseModel):
    title: str
    content: str
    specialty: Optional[str] = None
    documentType: Optional[str] = None
    source: Optional[str] = None
    publicationYear: Optional[int] = None

class IngestResponse(BaseModel):
    documentId: str
    chunksProcessed: int
    status: str

class HealthResponse(BaseModel):
    status: str
    service: str
    version: str = "1.0.0"


def extract_key_findings(text: str) -> List[str]:
    """Extract key findings from AI response text."""
    if not text:
        return []
    
    # Split into lines and look for KEY_FINDING markers
    findings = []
    lines = text.split('\n')
    
    current_summary_lines = []
    in_findings = False
    
    for line in lines:
        stripped = line.strip()
        if stripped.startswith('KEY_FINDING:'):
            in_findings = True
            finding = stripped.replace('KEY_FINDING:', '').strip()
            if finding:
                findings.append(finding)
        elif in_findings and stripped:
            # Continue collecting findings until we hit a non-bullet line
            if stripped.startswith('•') or stripped.startswith('-'):
                finding = stripped.lstrip('•-').strip()
                if finding:
                    findings.append(finding)
            else:
                in_findings = False
        else:
            current_summary_lines.append(line)
    
    return findings