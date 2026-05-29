from pydantic import BaseSettings
import os

class Settings(BaseSettings):
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    PINECONE_API_KEY: str = os.getenv("PINECONE_API_KEY", "")
    PINECONE_ENVIRONMENT: str = os.getenv("PINECONE_ENVIRONMENT", "us-west1-gcp")
    PINECONE_INDEX_NAME: str = os.getenv("PINECONE_INDEX_NAME", "nileopedia-medical")
    ELASTICSEARCH_URL: str = os.getenv("ELASTICSEARCH_URL", "http://localhost:9200")
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "text-embedding-3-large")
    CHAT_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o")
    MAX_CHUNK_TOKENS: int = 500
    MIN_CHUNK_TOKENS: int = 100
    CHUNK_OVERLAP: int = 50
    PINECONE_NAMESPACE: str = "general"
    TOP_K_DEFAULT: int = 10
    SEMANTIC_WEIGHT: float = 0.7
    KEYWORD_WEIGHT: float = 0.3

settings = Settings()