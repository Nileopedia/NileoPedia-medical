import asyncio
from openai import AsyncOpenAI
from app.core.config import settings
from app.models.schemas import EmbeddingRequest
import tiktoken
import hashlib
import redis.asyncio as redis
import logging

logger = logging.getLogger(__name__)

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
redis_client = redis.from_url(settings.REDIS_URL)

def count_tokens(text: str) -> int:
    """Count tokens using tiktoken."""
    encoding = tiktoken.get_encoding("cl100k_base")
    return len(encoding.encode(text))

async def get_cached_embedding(text: str) -> list[float] | None:
    """Get embedding from Redis cache if available."""
    cache_key = f"embedding:{hashlib.md5(text.encode()).hexdigest()}"
    cached = await redis_client.get(cache_key)
    if cached:
        return [float(x) for x in cached.decode().split(",")]
    return None

async def cache_embedding(text: str, embedding: list[float]) -> None:
    """Cache embedding in Redis."""
    cache_key = f"embedding:{hashlib.md5(text.encode()).hexdigest()}"
    await redis_client.setex(cache_key, 86400, ",".join(map(str, embedding)))

async def generate_embedding(request: EmbeddingRequest) -> list[float]:
    """Generate embedding for text with caching."""
    if not request.text or not request.text.strip():
        raise ValueError("Text cannot be empty")
    
    cached = await get_cached_embedding(request.text)
    if cached:
        return cached

    try:
        response = await client.embeddings.create(
            model=request.model,
            input=request.text
        )
        embedding = response.data[0].embedding
        await cache_embedding(request.text, embedding)
        logger.info(f"Successfully generated embedding for text of length {len(request.text)}")
        return embedding
    except Exception as e:
        logger.error(f"OpenAI embedding generation failed: {str(e)}")
        raise

async def generate_batch_embeddings(texts: list[str], model: str = None) -> list[list[float]]:
    """Generate embeddings for multiple texts in batch."""
    if model is None:
        model = settings.EMBEDDING_MODEL

    uncached_texts = []
    uncached_indices = []
    
    for i, text in enumerate(texts):
        if not text or not text.strip():
            texts[i] = []
        else:
            cached = await get_cached_embedding(text)
            if cached:
                texts[i] = cached
            else:
                uncached_texts.append(text)
                uncached_indices.append(i)

    if uncached_texts:
        try:
            response = await client.embeddings.create(
                model=model,
                input=uncached_texts
            )
            for idx, data in zip(uncached_indices, response.data):
                embedding = data.embedding
                texts[idx] = embedding
                await cache_embedding(uncached_texts[uncached_indices.index(idx)], embedding)
        except Exception as e:
            logger.error(f"OpenAI batch embedding generation failed: {str(e)}")
            raise

    return texts