#!/usr/bin/env python3
"""Seed Pinecone with sample medical documents for each specialty (standalone with fake embeddings)."""

import os
import random
import hashlib
from pinecone import Pinecone, ServerlessSpec

# Configuration from environment
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY", "")
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "nileopedia-medical")
PINECONE_ENVIRONMENT = os.getenv("PINECONE_ENVIRONMENT", "us-east-1-aws")

# MiniLM-L6-v2 produces 384-dimensional embeddings
EMBEDDING_DIMENSION = 384

# Sample medical documents for each specialty
SAMPLE_DOCUMENTS = {
    "general": [
        {
            "title": "Clinical Practice Guidelines Overview",
            "content": "Clinical practice guidelines provide evidence-based recommendations for healthcare providers. These guidelines are developed through systematic reviews of medical literature and expert consensus. Implementation of guidelines improves patient outcomes and reduces healthcare costs. Regular updates ensure current best practices are followed.",
            "source": "WHO Guidelines",
        }
    ],
    "cardiology": [
        {
            "title": "Heart Failure Management Guidelines 2024",
            "content": "Heart failure HF is a complex clinical syndrome resulting from structural or functional impairment of ventricular filling or ejection. The 2024 AHA ACC HFSA guidelines recommend ACE inhibitors beta-blockers and ARNIs as first-line therapy for HFrEF. SGLT2 inhibitors have shown significant mortality benefit. Cardiac resynchronization therapy improves outcomes in eligible patients.",
            "source": "American Heart Association",
        },
        {
            "title": "Acute Myocardial Infarction Treatment",
            "content": "ST-elevation myocardial infarction STEMI requires immediate reperfusion therapy. Primary PCI is the preferred reperfusion strategy when performed by experienced operators within 90 minutes of first medical contact. Dual antiplatelet therapy with aspirin and a P2Y12 inhibitor is mandatory. High-intensity statins reduce cardiovascular events.",
            "source": "European Heart Journal",
        }
    ],
    "endocrinology": [
        {
            "title": "Type 2 Diabetes Management 2024",
            "content": "Type 2 diabetes mellitus T2DM management focuses on glycemic control to prevent complications. Metformin remains first-line therapy. GLP-1 receptor agonists and SGLT2 inhibitors provide cardiovascular and renal benefits beyond glucose control. HbA1c target is typically less than 7 for most patients.",
            "source": "American Diabetes Association",
        }
    ],
    "oncology": [
        {
            "title": "Breast Cancer Treatment Protocols 2024",
            "content": "Breast cancer treatment depends on hormone receptor status HER2 status and disease stage. HR-positive tumors benefit from endocrine therapy for 5-10 years. HER2-positive tumors require trastuzumab-based regimens. Triple-negative breast cancer responds to platinum-containing neoadjuvant therapy. Immunotherapy atezolizumab improves outcomes.",
            "source": "Journal of Clinical Oncology",
        }
    ],
    "neurology": [
        {
            "title": "Alzheimers Disease Management 2024",
            "content": "Alzheimers disease is the most common cause of dementia. Cholinesterase inhibitors donepezil rivastigmine galantamine provide symptomatic improvement. NMDA receptor antagonist memantine may be added for moderate-severe disease. Disease-modifying therapies targeting amyloid-beta are emerging.",
            "source": "Alzheimers Association",
        }
    ],
    "gastroenterology": [
        {
            "title": "Peptic Ulcer Disease Management",
            "content": "Peptic ulcer disease is primarily caused by H. pylori infection or NSAID use. H. pylori eradication eliminates most ulcers. Triple therapy with PPI clarithromycin and amoxicillin is standard. H2 receptor antagonists and sucralfate promote healing. Endoscopy is indicated for bleeding or perforation.",
            "source": "American Journal of Gastroenterology",
        }
    ]
}

def get_namespace_for_specialty(specialty: str) -> str:
    """Map specialty to Pinecone namespace."""
    namespace_map = {
        "cardiology": "cardiology",
        "endocrinology": "endocrinology",
        "oncology": "oncology",
        "neurology": "neurology",
        "gastroenterology": "gastroenterology",
    }
    return namespace_map.get(specialty.lower(), "general")

def generate_fake_embedding(text: str, dim: int = EMBEDDING_DIMENSION) -> list:
    """Generate deterministic fake embedding for demo purposes."""
    h = hashlib.md5(text.encode()).hexdigest()
    random.seed(int(h[:8], 16))
    return [random.gauss(0, 1) for _ in range(dim)]

def chunk_text(text: str, max_tokens: int = 200) -> list:
    """Simple text chunking."""
    words = text.split()
    chunks = []
    for i in range(0, len(words), max_tokens):
        chunk_text = " ".join(words[i:i + max_tokens])
        chunks.append(chunk_text[:800])
    return chunks if chunks else [text[:800]]

def seed_pinecone():
    """Seed Pinecone with sample documents."""
    if not PINECONE_API_KEY:
        print("ERROR: PINECONE_API_KEY not set")
        return
    
    # Initialize Pinecone
    pc = Pinecone(api_key=PINECONE_API_KEY)
    
    # Create index if it doesn't exist
    existing_indexes = [idx.name for idx in pc.list_indexes()]
    if PINECONE_INDEX_NAME not in existing_indexes:
        print(f"Creating Pinecone index: {PINECONE_INDEX_NAME} with {EMBEDDING_DIMENSION} dimensions")
        parts = PINECONE_ENVIRONMENT.split("-")
        region = "-".join(parts[:2]) if len(parts) >= 2 else "us-east-1"
        cloud = parts[-1] if len(parts) >= 3 else "aws"
        pc.create_index(
            name=PINECONE_INDEX_NAME,
            dimension=EMBEDDING_DIMENSION,
            metric="cosine",
            spec=ServerlessSpec(cloud=cloud, region=region)
        )
        print(f"Index created: {PINECONE_INDEX_NAME}")
    
    index = pc.Index(PINECONE_INDEX_NAME)
    
    for specialty, documents in SAMPLE_DOCUMENTS.items():
        print(f"\nSeeding {specialty} ({len(documents)} documents)...")
        namespace = get_namespace_for_specialty(specialty)
        
        for doc in documents:
            document_id = f"seed-{specialty}-{doc['title'].lower().replace(' ', '-')}"[:50]
            chunks = chunk_text(doc["content"])
            
            vectors = []
            for i, chunk in enumerate(chunks):
                embedding = generate_fake_embedding(chunk)
                
                vectors.append((
                    f"{document_id}-chunk-{i}",
                    embedding,
                    {
                        "document_id": document_id,
                        "title": doc["title"],
                        "source": doc.get("source", "internal"),
                        "specialty": specialty,
                        "chunk_text": chunk,
                        "publication_year": 2024,
                    }
                ))
            
            if vectors:
                try:
                    index.upsert(vectors=vectors, namespace=namespace)
                    print(f"  Added {len(vectors)} vectors for: {doc['title']}")
                except Exception as e:
                    print(f"  Upsert error for {doc['title']}: {e}")
    
    print("\nSeeding complete!")

if __name__ == "__main__":
    seed_pinecone()