#!/usr/bin/env python3
"""Initialize Pinecone index for NileoPedia."""

import os
from pinecone import Pinecone, ServerlessSpec

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY", "")
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "nileopedia-medical")
PINECONE_ENVIRONMENT = os.getenv("PINECONE_ENVIRONMENT", "us-east-1-aws")

if not PINECONE_API_KEY:
    print("PINECONE_API_KEY not set")
    exit(1)

pc = Pinecone(api_key=PINECONE_API_KEY)

index_name = PINECONE_INDEX_NAME
existing_indexes = [idx.name for idx in pc.list_indexes()]

if index_name not in existing_indexes:
    # Parse region from environment
    parts = PINECONE_ENVIRONMENT.split("-")
    region = "-".join(parts[:2]) if len(parts) >= 2 else "us-east-1"
    cloud = parts[-1] if len(parts) >= 3 else "aws"
    
    print(f"Creating Pinecone index: {index_name}")
    pc.create_index(
        name=index_name,
        dimension=3072,
        metric="cosine",
        spec=ServerlessSpec(cloud=cloud, region=region)
    )
    print(f"Index created: {index_name}")
else:
    print(f"Index already exists: {index_name}")