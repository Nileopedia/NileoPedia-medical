from openai import OpenAI
import os
from typing import List
import logging

logger = logging.getLogger(__name__)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "text-embedding-3-large")

def create_embedding(text: str) -> List[float]:
    """
    Generate embedding for text using OpenAI.
    
    Args:
        text: Input text to embed
        
    Returns:
        List of floats representing the embedding vector
        
    Raises:
        ValueError: If text is empty or None
        Exception: If OpenAI API call fails
    """
    if not text or not text.strip():
        raise ValueError("Text cannot be empty")
    
    try:
        response = client.embeddings.create(
            model=EMBEDDING_MODEL,
            input=text
        )
        embedding = response.data[0].embedding
        logger.info(f"Successfully generated embedding for text of length {len(text)}")
        return embedding
    except Exception as e:
        logger.error(f"OpenAI embedding generation failed: {str(e)}")
        raise


class EmbeddingService:
    """Service layer for embedding generation."""
    
    @staticmethod
    def generate(text: str) -> List[float]:
        """Generate embedding for the given text."""
        return create_embedding(text)