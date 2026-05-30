import os

class Settings:
    def __init__(self):
        self.OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
        self.PINECONE_API_KEY = os.getenv("PINECONE_API_KEY", "")
        self.PINECONE_ENVIRONMENT = os.getenv("PINECONE_ENVIRONMENT", "us-west1-gcp")
        self.PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "nileopedia-medical")
        self.ELASTICSEARCH_URL = os.getenv("ELASTICSEARCH_URL", "https://my-elasticsearch-project-dfcb85.es.us-east-1.aws.elastic.cloud:443")
        self.REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
        self.EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "text-embedding-3-large")
        self.CHAT_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o")
        self.MAX_CHUNK_TOKENS = int(os.getenv("MAX_CHUNK_TOKENS", "500"))
        self.MIN_CHUNK_TOKENS = int(os.getenv("MIN_CHUNK_TOKENS", "100"))
        self.CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", "50"))

settings = Settings()