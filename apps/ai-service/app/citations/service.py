import re
from typing import List
from app.models.schemas import Citation, DocumentChunk

def extract_citations(chunks: List[DocumentChunk]) -> List[Citation]:
    """Extract citations from retrieved chunks."""
    citations = []
    seen_titles = set()
    
    for chunk in chunks:
        metadata = chunk.metadata
        
        title = metadata.get("title") or metadata.get("source") or "Unknown Source"
        if title in seen_titles:
            continue
        seen_titles.add(title)
        
        citations.append(Citation(
            title=title,
            source=metadata.get("source", "") or "",
            authors=metadata.get("authors"),
            publicationYear=metadata.get("publicationYear"),
            doi=metadata.get("doi"),
            url=metadata.get("url"),
            pageNumber=metadata.get("pageNumber"),
            sectionTitle=metadata.get("sectionTitle"),
        ))
    
    return citations

def map_citations_to_sections(chunks: List[DocumentChunk]) -> dict:
    """Map citations to specific sections/paragraphs."""
    section_map = {}
    for chunk in chunks:
        section = chunk.metadata.get("sectionTitle")
        if section:
            if section not in section_map:
                section_map[section] = []
            section_map[section].append(chunk)
    return section_map

def format_context_with_citations(chunks: List[DocumentChunk]) -> str:
    """Format retrieved chunks as context with citation markers."""
    formatted = []
    for i, chunk in enumerate(chunks, 1):
        metadata = chunk.metadata
        citation_info = f"[Source: {metadata.get('source', 'Unknown')}"
        if metadata.get("publicationYear"):
            citation_info += f", {metadata.get('publicationYear')}"
        citation_info += "]"
        
        formatted.append(f"[{i}] {chunk.text[:1500]}\n{citation_info}")
    
    return "\n\n".join(formatted)