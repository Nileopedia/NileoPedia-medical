#!/usr/bin/env python3
"""Seed Pinecone via backend API with sample medical documents for each specialty."""

import os
import requests
import json

# Sample medical documents for each specialty
SAMPLE_DOCUMENTS = {
    "general": [
        {
            "title": "Clinical Practice Guidelines Overview",
            "content": "Clinical practice guidelines provide evidence-based recommendations for healthcare providers. These guidelines are developed through systematic reviews of medical literature and expert consensus. Implementation of guidelines improves patient outcomes and reduces healthcare costs. Regular updates ensure current best practices are followed.",
            "specialty": "general",
            "source": "WHO Guidelines"
        }
    ],
    "cardiology": [
        {
            "title": "Heart Failure Management Guidelines 2024",
            "content": "Heart failure HF is a complex clinical syndrome resulting from structural or functional impairment of ventricular filling or ejection. The 2024 AHA ACC HFSA guidelines recommend ACE inhibitors beta-blockers and ARNIs as first-line therapy for HFrEF. SGLT2 inhibitors have shown significant mortality benefit. Cardiac resynchronization therapy improves outcomes in eligible patients. Regular monitoring of ejection fraction is essential.",
            "specialty": "cardiology",
            "source": "American Heart Association"
        },
        {
            "title": "Acute Myocardial Infarction Treatment",
            "content": "ST-elevation myocardial infarction STEMI requires immediate reperfusion therapy. Primary PCI is the preferred reperfusion strategy when performed by experienced operators within 90 minutes of first medical contact. Dual antiplatelet therapy with aspirin and a P2Y12 inhibitor is mandatory. High-intensity statins reduce cardiovascular events. Beta-blockers reduce mortality in acute phase.",
            "specialty": "cardiology",
            "source": "European Heart Journal"
        }
    ],
    "endocrinology": [
        {
            "title": "Type 2 Diabetes Management 2024",
            "content": "Type 2 diabetes mellitus T2DM management focuses on glycemic control to prevent complications. Metformin remains first-line therapy. GLP-1 receptor agonists and SGLT2 inhibitors provide cardiovascular and renal benefits beyond glucose control. HbA1c target is typically less than 7 for most patients. Regular screening for retinopathy nephropathy and neuropathy is recommended.",
            "specialty": "endocrinology",
            "source": "American Diabetes Association"
        }
    ],
    "oncology": [
        {
            "title": "Breast Cancer Treatment Protocols 2024",
            "content": "Breast cancer treatment depends on hormone receptor status HER2 status and disease stage. HR-positive tumors benefit from endocrine therapy for 5-10 years. HER2-positive tumors require trastuzumab-based regimens. Triple-negative breast cancer responds to platinum-containing neoadjuvant therapy. Immunotherapy atezolizumab improves outcomes in PD-L1 positive tumors.",
            "specialty": "oncology",
            "source": "Journal of Clinical Oncology"
        }
    ],
    "neurology": [
        {
            "title": "Alzheimers Disease Management",
            "content": "Alzheimers disease is the most common cause of dementia. Cholinesterase inhibitors donepezil rivastigmine galantamine provide symptomatic improvement. NMDA receptor antagonist memantine may be added for moderate-severe disease. Disease-modifying therapies targeting amyloid-beta are emerging. Cognitive stimulation and lifestyle modifications support management.",
            "specialty": "neurology",
            "source": "Alzheimers Association"
        }
    ],
    "gastroenterology": [
        {
            "title": "Peptic Ulcer Disease Management",
            "content": "Peptic ulcer disease is primarily caused by H. pylori infection or NSAID use. H. pylori eradication eliminates most ulcers. Triple therapy with PPI clarithromycin and amoxicillin is standard. H2 receptor antagonists and sucralfate promote healing. Endoscopy is indicated for bleeding perforation or gastric malignancy suspicion.",
            "specialty": "gastroenterology",
            "source": "American Journal of Gastroenterology"
        }
    ]
}

def seed_via_mock_api():
    """Seed using the backend mock ingest endpoint."""
    api_url = "http://localhost:3001/api/v1/mock-ai/ingest"
    
    print("Seeding via mock API endpoint...")
    
    for specialty, documents in SAMPLE_DOCUMENTS.items():
        print(f"\nSeeding {specialty} ({len(documents)} documents)...")
        for doc in documents:
            try:
                response = requests.post(api_url, json=doc, timeout=10)
                result = response.json()
                print(f"  Added: {doc['title']} - {result}")
            except Exception as e:
                print(f"  Error: {doc['title']} - {str(e)}")
    
    print("\nSeeding complete!")

if __name__ == "__main__":
    seed_via_mock_api()