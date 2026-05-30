
from pinecone import Pinecone, ServerlessSpec
import os

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY", "")
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "nileopedia-medical")
PINECONE_ENVIRONMENT = os.getenv("PINECONE_ENVIRONMENT", "us-west1-gcp")

pc = None
index = None

def init_pinecone():
    """Initialize Pinecone and create index if it doesn't exist."""
    global pc, index
    
    if not PINECONE_API_KEY:
        return None
        
    pc = Pinecone(api_key=PINECONE_API_KEY)
    
    # Check if index exists, create if not
    try:
        existing_indexes = [idx.name for idx in pc.list_indexes()]
        if PINECONE_INDEX_NAME not in existing_indexes:
            # Parse region from Pinecone environment
            if "gcp" in PINECONE_ENVIRONMENT.lower():
                cloud = "gcp"
                region = PINECONE_ENVIRONMENT.replace("-gcp", "")
            else:
                parts = PINECONE_ENVIRONMENT.split("-")
                region = "-".join(parts[:2]) if len(parts) >= 2 else "us-east-1"
                cloud = parts[-1] if len(parts) >= 3 else "aws"
            
            pc.create_index(
                name=PINECONE_INDEX_NAME,
                dimension=3072,  # text-embedding-3-large dimension
                metric="cosine",
                spec=ServerlessSpec(cloud=cloud, region=region)
            )
    except Exception as e:
        print(f"Pinecone index check/creation: {e}")
    
    index = pc.Index(PINECONE_INDEX_NAME)
    return index

# Initialize on import
index = init_pinecone()  