import re
from typing import List, Optional
from app.models.schemas import DocumentChunk
import tiktoken

encoding = tiktoken.get_encoding("cl100k_base")

def count_tokens(text: str) -> int:
    return len(encoding.encode(text))

def split_by_headings(text: str) -> List[str]:
    """Split text by markdown headings and section patterns."""
    patterns = [
        r'\n#{1,3}\s+',
        r'\n\d+\.\s+',
        r'\n[A-Z][a-z]+:.*\n',
    ]
    for pattern in patterns:
        text = re.sub(pattern, '\n\n===SECTION===\n', text)
    return [s.strip() for s in text.split('===SECTION===') if s.strip()]

def semantic_chunk(
    text: str,
    max_tokens: int = 500,
    min_tokens: int = 100,
    overlap: int = 50,
    preserve_headings: bool = True
) -> List[DocumentChunk]:
    """Chunk document semantically preserving headings and meaning."""
    chunks = []
    
    if preserve_headings:
        segments = split_by_headings(text)
    else:
        segments = [text]

    chunk_id = 0
    for segment in segments:
        tokens = encoding.encode(segment)
        
        if len(tokens) <= max_tokens:
            if len(tokens) >= min_tokens:
                chunks.append(DocumentChunk(
                    id=f"chunk-{chunk_id}",
                    text=segment,
                    metadata={"segment": True},
                    score=1.0
                ))
                chunk_id += 1
        else:
            for i in range(0, len(tokens), max_tokens - overlap):
                end_idx = min(i + max_tokens, len(tokens))
                chunk_tokens = tokens[i:end_idx]
                chunk_text = encoding.decode(chunk_tokens)
                
                if len(chunk_tokens) >= min_tokens or i == 0:
                    chunks.append(DocumentChunk(
                        id=f"chunk-{chunk_id}",
                        text=chunk_text,
                        metadata={"segment": False, "overlap": overlap},
                        score=1.0
                    ))
                    chunk_id += 1

    return chunks

def extract_citation_metadata(text: str) -> dict:
    """Extract potential citation metadata from text."""
    title_match = re.search(r'(?:Title|TITLE):\s*(.+?)(?:\n|$)', text)
    doi_match = re.search(r'(?:DOI|doi):\s*(10\.\d+/[^\s]+)', text)
    year_match = re.search(r'(?:\b(19|20)\d{2}\b)', text)
    
    return {
        "title": title_match.group(1) if title_match else None,
        "doi": doi_match.group(1) if doi_match else None,
        "publicationYear": int(year_match.group(0)) if year_match else None,
    }