#!/usr/bin/env python3
"""
Sample ingestion script to populate Pinecone vector database with medical documents.
Run this after deploying the ai-service container.
"""

import requests
import json
import os

AI_SERVICE_URL = os.getenv("AI_SERVICE_URL", "http://localhost:8000")

SAMPLE_DOCUMENTS = [
    {
        "title": "Atrial Fibrillation Management Guidelines 2024",
        "content": "Management of Atrial Fibrillation: 2024 AHA/ACC/HRS Guidelines\n\nAtrial fibrillation (AF) is the most common sustained cardiac arrhythmia. Management includes:\n\nAnticoagulation Therapy:\n- CHA2DS2-VASc score determines stroke risk\n- Score ≥2 in men or ≥3 in women: oral anticoagulation recommended\n- DOACs preferred over warfarin for most patients\n- Direct oral anticoagulants include rivaroxaban, apixaban, dabigatran, and edoxaban\n\nRate vs Rhythm Control:\n- Rate control preferred for most patients with persistent AF\n- Rhythm control considered for symptomatic patients or early AF\n- Catheter ablation recommended for patients with heart failure and AF\n\nRisk Factor Management:\n- Address modifiable risk factors: hypertension, diabetes, sleep apnea, obesity\n- Lifestyle modifications: alcohol moderation, exercise, weight loss\n- Treatment of underlying conditions improves outcomes",
        "specialty": "cardiology",
        "documentType": "guideline",
        "source": "Journal of the American College of Cardiology",
        "publicationYear": 2024,
        "authors": "American Heart Association, American College of Cardiology"
    },
    {
        "title": "Type 2 Diabetes Management in Older Adults",
        "content": "Type 2 Diabetes Management in Older Adults: ADA Standards of Care 2024\n\nGlycemic Targets:\n- Healthy older adults: HbA1c < 7.5-8.0%\n- Complex/intermediate health: HbA1c < 8.0%\n- Very complex/poor health: HbA1c < 8.5-9.0%\n\nFirst-Line Therapy:\n- Metformin remains first-line if eGFR > 30 ml/min/1.73m²\n- Dosing: Start low, go slow to minimize GI effects\n- Monitor renal function regularly\n\nSecond-Line Agents:\n- SGLT2 inhibitors: Preferred for CVD or CKD\n- GLP-1 receptor agonists: Weight loss benefits\n- Avoid sulfonylureas due to hypoglycemia risk in elderly\n\nHypoglycemia Prevention:\n- Insulin requires careful titration\n- Use longer-acting insulin analogs\n- Patient and caregiver education essential",
        "specialty": "endocrinology",
        "documentType": "clinical-practice",
        "source": "Diabetes Care",
        "publicationYear": 2024,
        "authors": "American Diabetes Association"
    },
    {
        "title": "2024 Hypertension Guidelines Summary",
        "content": "2024 ACC/AHA Hypertension Guidelines\n\nBlood Pressure Targets:\n- General population: < 130/80 mmHg\n- Adults ≥65 years: < 130/80 mmHg\n- With compelling indications: < 130/80 mmHg\n\nInitial Therapy:\n- Thiazide diuretics, ACE inhibitors, or ARBs as first-line\n- Calcium channel blockers as alternatives\n- Combination therapy often needed\n\nLifestyle Modifications:\n- Sodium reduction to < 2300 mg daily\n- DASH diet pattern\n- Regular physical activity\n- Weight loss for overweight patients\n- Alcohol moderation\n- Smoking cessation\n\nHigh-Risk Patients:\n- Secondary hypertension evaluation when indicated\n- Consider ambulatory BP monitoring\n- Screen for target organ damage",
        "specialty": "cardiology",
        "documentType": "guideline",
        "source": "Hypertension Journal",
        "publicationYear": 2024,
        "authors": "American College of Cardiology"
    },
    {
        "title": "Polypharmacy Management in Older Adults",
        "content": "Polypharmacy Management in Older Adults\n\nKey Principles:\n- Regular medication reconciliation\n- Deprescribing when appropriate\n- Minimize anticholinergic burden\n- Avoid inappropriate medications (Beers criteria)\n\nHigh-Risk Medications:\n- Benzodiazepines: Fall risk, cognitive impairment\n- Anticholinergics: Confusion, constipation\n- NSAIDs: GI bleed, renal dysfunction\n- Antihypertensives: Orthostatic hypotension\n\nTools for Assessment:\n- Beers Criteria for Potentially Inappropriate Medication\n- STOPP/START criteria\n- Medication Appropriateness Index",
        "specialty": "geriatrics",
        "documentType": "review",
        "source": "Journal of the American Geriatrics Society",
        "publicationYear": 2023,
        "authors": "AGS Beers Criteria Update Group"
    },
    {
        "title": "Evidence-Based Internal Medicine Essentials",
        "content": "Evidence-Based Clinical Practice: Internal Medicine Essentials\n\nDiagnostic Reasoning:\n- Pattern recognition in clinical presentation\n- Likelihood ratios guide test interpretation\n- Bayesian approach to pre-test probability\n\nCommon Conditions:\n- Upper respiratory infections: Antibiotics not routinely indicated\n- Acute bronchitis: Typically viral, supportive care\n- Uncomplicated UTI in women: Short course antibiotics\n- Acute low back pain: Avoid imaging unless red flags\n\nPrevention:\n- Cancer screening per USPSTF guidelines\n- Immunizations: Influenza, pneumococcal, shingles\n- Cardiovascular risk assessment",
        "specialty": "general",
        "documentType": "review",
        "source": "New England Journal of Medicine",
        "publicationYear": 2024,
        "authors": "Internal Medicine Society"
    }
]

def ingest_documents():
    """Ingest all sample documents into the vector database."""
    print(f"Ingesting documents to {AI_SERVICE_URL}...")

    for i, doc in enumerate(SAMPLE_DOCUMENTS, 1):
        try:
            response = requests.post(
                f"{AI_SERVICE_URL}/ingest/",
                json=doc,
                timeout=30
            )
            if response.status_code == 200:
                result = response.json()
                print(f"✓ Document {i}: {doc['title'][:50]}... - {result['chunksProcessed']} chunks")
            else:
                print(f"✗ Document {i}: Failed - {response.status_code} {response.text}")
        except Exception as e:
            print(f"✗ Document {i}: Error - {str(e)}")

    print("\nDone! Check Pinecone index for vectors.")

if __name__ == "__main__":
    ingest_documents()