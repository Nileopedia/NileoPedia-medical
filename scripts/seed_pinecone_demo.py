#!/usr/bin/env python3
"""Seed Pinecone with sample medical documents using deterministic vectors."""

import os
import random
import hashlib
from pinecone import Pinecone, ServerlessSpec

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY", "")
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "nileopedia-medical")
PINECONE_ENVIRONMENT = os.getenv("PINECONE_ENVIRONMENT", "us-east-1-aws")

SAMPLE_DOCUMENTS = {
    "general": [{"title": "Clinical Practice Guidelines Overview", "content": "Clinical practice guidelines provide evidence-based recommendations for healthcare providers.", "source": "WHO Guidelines"}],
    "cardiology": [{"title": "Heart Failure Management Guidelines 2024", "content": "Heart failure therapy includes ACE inhibitors beta-blockers ARNIs and SGLT2 inhibitors.", "source": "American Heart Association"}],
    "endocrinology": [{"title": "Type 2 Diabetes Management 2024", "content": "Metformin is first-line for T2DM. GLP-1 agonists provide cardiovascular benefit.", "source": "American Diabetes Association"}],
    "oncology": [{"title": "Breast Cancer Treatment Protocols 2024", "content": "Breast cancer treatment depends on hormone receptor and HER2 status.", "source": "Journal of Clinical Oncology"}],
    "neurology": [{"title": "Alzheimers Disease Management 2024", "content": "Cholinesterase inhibitors improve cognition in Alzheimers disease.", "source": "Alzheimers Association"}],
    "gastroenterology": [{"title": "Peptic Ulcer Disease Management", "content": "H. pylori eradication eliminates most peptic ulcers.", "source": "American Journal of Gastroenterology"}]
}

def get_namespace(specialty):
    mapping = {"cardiology": "cardiology", "endocrinology": "endocrinology", "oncology": "oncology", "neurology": "neurology", "gastroenterology": "gastroenterology"}
    return mapping.get(specialty.lower(), "general")

def deterministic_embedding(text, seed=0, dim=3072):
    """Generate deterministic embedding matching AI service demo mode."""
    h = int(hashlib.sha256(text.encode()).hexdigest()[:16], 16)
    random.seed(h + seed)
    vec = [random.gauss(0, 1) for _ in range(dim)]
    norm = sum(x*x for x in vec) ** 0.5
    return [x/norm for x in vec] if norm > 0 else vec

def main():
    if not PINECONE_API_KEY:
        print("PINECONE_API_KEY not set")
        return
    
    pc = Pinecone(api_key=PINECONE_API_KEY)
    existing = [idx.name for idx in pc.list_indexes()]
    
    if PINECONE_INDEX_NAME not in existing:
        parts = PINECONE_ENVIRONMENT.split("-")
        region = "-".join(parts[:2]) if len(parts) >= 2 else "us-east-1"
        cloud = parts[-1] if len(parts) >= 3 else "aws"
        pc.create_index(name=PINECONE_INDEX_NAME, dimension=3072, metric="cosine", spec=ServerlessSpec(cloud=cloud, region=region))
    
    index = pc.Index(PINECONE_INDEX_NAME)
    
    for specialty, docs in SAMPLE_DOCUMENTS.items():
        namespace = get_namespace(specialty)
        print(f"\nSeeding {specialty}...")
        for doc in docs:
            doc_id = f"demo-{specialty}-{hash(doc['title']) % 10000}"
            embedding = deterministic_embedding(doc['content'])
            vectors = [(doc_id, embedding, {"title": doc['title'], "source": doc['source'], "specialty": specialty, "chunk_text": doc['content'][:500]})]
            index.upsert(vectors=vectors, namespace=namespace)
            print(f"  Added: {doc['title']}")
    
    print("\nDone! Seed data ready for demo mode.")

if __name__ == "__main__":
    main()