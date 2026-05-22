export interface Citation {
  id: string;
  title: string;
  authors: string;
  journal: string;
  year: number;
  doi: string;
  pmid: string;
  snippet: string;
  relevanceScore: number;
  type: 'Clinical Trial' | 'Meta-Analysis' | 'Guideline' | 'Review';
  url: string;
}

export interface AIResponseSection {
  id: string;
  title: string;
  content: string;
  type: 'summary' | 'clinical_guidance' | 'contraindications' | 'evidence_table' | 'alert';
}

export interface MedicalQuery {
  id: string;
  query: string;
  category: 'Cardiology' | 'Oncology' | 'Neurology' | 'Endocrinology' | 'Pediatrics' | 'Immunology';
  urgency: 'Routine' | 'Urgent' | 'Emergency';
  patientContext?: string;
  timestamp: string;
  confidenceScore: number; // 0 - 100
  validationStatus: 'Validated' | 'Pending Validation' | 'Rejected' | 'Requires Revision';
  validatedBy?: string;
  validatorNotes?: string;
  sections: AIResponseSection[];
  citations: Citation[];
}

export interface ValidationQueueItem {
  id: string;
  queryId: string;
  queryText: string;
  category: string;
  aiSummary: string;
  confidenceScore: number;
  submittedAt: string;
  assignedValidator: string;
  status: 'Pending' | 'In Review' | 'Flagged';
  discrepancyRisk: 'Low' | 'Medium' | 'High';
  citationsCount: number;
  ragSources: string[];
}

export interface AnalyticsMetric {
  name: string;
  queries: number;
  validated: number;
  accuracy: number;
}

export const INITIAL_CITATIONS: Citation[] = [
  {
    id: 'cit-1',
    title: 'Efficacy of SGLT2 Inhibitors in Heart Failure with Preserved Ejection Fraction: A Meta-Analysis of Randomized Clinical Trials',
    authors: 'Vaduganathan M, Docherty KF, Claggett BL, et al.',
    journal: 'The Lancet',
    year: 2022,
    doi: '10.1016/S0140-6736(22)01429-5',
    pmid: '36030799',
    snippet: 'SGLT2 inhibitors significantly reduced the composite endpoint of cardiovascular death or hospitalization for heart failure in patients with HFpEF, demonstrating a 20% relative risk reduction across pooled trial data.',
    relevanceScore: 98,
    type: 'Meta-Analysis',
    url: 'https://pubmed.ncbi.nlm.nih.gov/36030799/'
  },
  {
    id: 'cit-2',
    title: '2022 AHA/ACC/HFSA Guideline for the Management of Heart Failure',
    authors: 'Heidenreich PA, Bozkurt B, Aguilar D, et al.',
    journal: 'Journal of the American College of Cardiology',
    year: 2022,
    doi: '10.1016/j.jacc.2021.12.012',
    pmid: '35378671',
    snippet: 'Class 2a recommendation for SGLT2 inhibitors (dapagliflozin or empagliflozin) in patients with HFpEF to decrease hospitalizations for heart failure and cardiovascular mortality.',
    relevanceScore: 99,
    type: 'Guideline',
    url: 'https://pubmed.ncbi.nlm.nih.gov/35378671/'
  },
  {
    id: 'cit-3',
    title: 'EMPEROR-Preserved Trial: Empagliflozin in Heart Failure with a Preserved Ejection Fraction',
    authors: 'Anker SD, Butler J, Filippatos G, et al.',
    journal: 'New England Journal of Medicine',
    year: 2021,
    doi: '10.1056/NEJMoa2107038',
    pmid: '34449189',
    snippet: 'Empagliflozin reduced the combined risk of cardiovascular death or hospitalization for heart failure in patients with heart failure and a preserved ejection fraction, regardless of diabetes status.',
    relevanceScore: 96,
    type: 'Clinical Trial',
    url: 'https://pubmed.ncbi.nlm.nih.gov/34449189/'
  },
  {
    id: 'cit-4',
    title: 'Management of Immune Checkpoint Inhibitor-Related Myocarditis: Clinical Practice Guidelines',
    authors: 'Neilan TG, Rothenberg ML, Amiri-Kordestani L, et al.',
    journal: 'Journal of Clinical Oncology',
    year: 2023,
    doi: '10.1200/JCO.22.02641',
    pmid: '36897100',
    snippet: 'Immediate high-dose intravenous corticosteroids (methylprednisolone 1,000 mg/day) are recommended as first-line therapy upon suspicion of ICI-myocarditis. Abatacept or alemtuzumab should be considered in steroid-refractory cases.',
    relevanceScore: 95,
    type: 'Guideline',
    url: 'https://pubmed.ncbi.nlm.nih.gov/36897100/'
  },
  {
    id: 'cit-5',
    title: 'Safety and Efficacy of Dual Biologic Therapy in Severe Refractory Crohn\'s Disease',
    authors: 'Privitera G, Pugliese D, Onali S, et al.',
    journal: 'Inflammatory Bowel Diseases',
    year: 2023,
    doi: '10.1093/ibd/izac251',
    pmid: '36511520',
    snippet: 'Combination of ustekinumab and vedolizumab showed clinical response in 68% of patients with multi-drug resistant Crohn\'s disease, though opportunistic infection risk increased by 4.2%.',
    relevanceScore: 91,
    type: 'Clinical Trial',
    url: 'https://pubmed.ncbi.nlm.nih.gov/36511520/'
  }
];

export const INITIAL_QUERIES: MedicalQuery[] = [
  {
    id: 'query-101',
    query: 'What is the latest clinical consensus on initiating SGLT2 inhibitors for Heart Failure with Preserved Ejection Fraction (HFpEF) in patients with eGFR between 25-30 mL/min?',
    category: 'Cardiology',
    urgency: 'Routine',
    patientContext: '68yo female, NYHA Class III HFpEF (LVEF 54%), Type 2 Diabetes, CKD Stage 4 (eGFR 28 mL/min/1.73m²). Current meds: Furosemide 40mg qd, Lisinopril 10mg qd.',
    timestamp: '2026-03-24T14:32:00Z',
    confidenceScore: 96,
    validationStatus: 'Validated',
    validatedBy: 'Dr. Marcus Vance (Chief Medical AI Validator)',
    validatorNotes: 'Excellent synthesis of the 2022 AHA/ACC guidelines and EMPEROR-Preserved data. The eGFR threshold warning is highly accurate and clinically vital.',
    sections: [
      {
        id: 'sec-1',
        title: 'Clinical Summary & Consensus',
        content: 'Current clinical consensus (2022 AHA/ACC/HFSA Guidelines) strongly supports the initiation of SGLT2 inhibitors (such as **Empagliflozin 10 mg** or **Dapagliflozin 10 mg**) in patients with Heart Failure with Preserved Ejection Fraction (HFpEF) to reduce cardiovascular mortality and heart failure hospitalizations (Class 2a Recommendation).',
        type: 'summary'
      },
      {
        id: 'sec-2',
        title: 'Renal Considerations (eGFR 25-30 mL/min)',
        content: 'In patients with CKD Stage 4 (eGFR 25-30 mL/min/1.73m²):\n\n* **Empagliflozin** is approved and studied down to an eGFR of **20 mL/min/1.73m²** (EMPEROR-Preserved trial criteria).\n* **Dapagliflozin** is approved down to an eGFR of **25 mL/min/1.73m²** (DELIVER trial criteria).\n* **Expected Dip:** A temporary, benign dip in eGFR (up to 30%) is anticipated during the first 2-4 weeks of initiation due to hemodynamic changes. Do not discontinue unless the dip exceeds 30% or is accompanied by acute volume depletion.',
        type: 'clinical_guidance'
      },
      {
        id: 'sec-3',
        title: 'Critical Contraindications & Warnings',
        content: '⚠️ **CRITICAL WARNING:** Do not initiate if eGFR < 20 mL/min/1.73m² or in patients on dialysis. Monitor closely for signs of **euglycemic diabetic ketoacidosis (EDKA)**, especially given the comorbid Type 2 Diabetes status. Temporarily withhold SGLT2i during acute illness, fasting, or major surgical procedures.',
        type: 'contraindications'
      },
      {
        id: 'sec-4',
        title: 'Evidence & Dosing Table',
        content: '| Medication | Target Dose | Minimum eGFR | Primary Trial | NNT (Comp. Outcome) |\n| :--- | :--- | :--- | :--- | :--- |\n| **Empagliflozin** | 10 mg once daily | 20 mL/min/1.73m² | EMPEROR-Preserved | 31 (over 2.1 yrs) |\n| **Dapagliflozin** | 10 mg once daily | 25 mL/min/1.73m² | DELIVER | 32 (over 2.3 yrs) |',
        type: 'evidence_table'
      }
    ],
    citations: [INITIAL_CITATIONS[0], INITIAL_CITATIONS[1], INITIAL_CITATIONS[2]]
  },
  {
    id: 'query-102',
    query: 'Management protocol for suspected Immune Checkpoint Inhibitor (ICI) induced myocarditis in a patient receiving Pembrolizumab for metastatic melanoma.',
    category: 'Oncology',
    urgency: 'Emergency',
    patientContext: '54yo male, metastatic cutaneous melanoma on Pembrolizumab cycle 4. Presented with acute dyspnea, chest pain, troponin T elevation (1.4 ng/mL), and new LBBB on ECG.',
    timestamp: '2026-03-24T16:15:00Z',
    confidenceScore: 94,
    validationStatus: 'Pending Validation',
    sections: [
      {
        id: 'sec-102-1',
        title: 'Immediate Action Plan',
        content: '🚨 **MEDICAL EMERGENCY:** Suspected Immune Checkpoint Inhibitor (ICI) myocarditis carries a mortality rate of up to 50%. Immediate cessation of Pembrolizumab and prompt initiation of high-dose immunosuppression is mandatory prior to definitive biopsy confirmation.',
        type: 'alert'
      },
      {
        id: 'sec-102-2',
        title: 'First-Line Therapy Protocol',
        content: '1. **Discontinue Immunotherapy:** Permanently discontinue Pembrolizumab.\n2. **Corticosteroids:** Administer **Intravenous Methylprednisolone 1,000 mg daily** for 3 to 5 days.\n3. **Cardiac Monitoring:** Admit immediately to Cardiac Intensive Care Unit (CICU) with continuous telemetry and daily troponin/BNP tracking.\n4. **Diagnostic Workup:** Urgent transthoracic echocardiogram (TTE) and cardiac magnetic resonance imaging (CMR) if stable. Endomyocardial biopsy (EMB) remains the gold standard.',
        type: 'clinical_guidance'
      },
      {
        id: 'sec-102-3',
        title: 'Refractory Disease Management',
        content: 'If clinical instability or troponin elevation persists after 24-48 hours of high-dose steroids, escalate immediately to second-line immunosuppression:\n\n* **Abatacept** (CTLA-4 agonist): 500 mg (if <65kg) or 750 mg (if 65-100kg) IV.\n* **Alemtuzumab** (anti-CD52): 30 mg IV single dose.\n* **Anti-thymocyte globulin (ATG)** or Plasma Exchange (PLEX) as adjunctive support.',
        type: 'contraindications'
      }
    ],
    citations: [INITIAL_CITATIONS[3]]
  },
  {
    id: 'query-103',
    query: 'What are the risks and clinical protocols for combining Vedolizumab and Ustekinumab in severe refractory Crohn\'s disease?',
    category: 'Immunology',
    urgency: 'Routine',
    patientContext: '32yo male, severe ileocolonic Crohn\'s disease refractory to Infliximab, Adalimumab, and monotherapy Vedolizumab. Considering dual biologic therapy.',
    timestamp: '2026-03-23T09:11:00Z',
    confidenceScore: 88,
    validationStatus: 'Requires Revision',
    validatedBy: 'Dr. Sarah Jenkins (Gastroenterology AI Lead)',
    validatorNotes: 'The AI did not adequately emphasize the increased risk of opportunistic fungal infections when combining anti-integrin and anti-IL-12/23 mechanisms. Needs explicit monitoring protocol.',
    sections: [
      {
        id: 'sec-103-1',
        title: 'Dual Biologic Rationale',
        content: 'Combining biologics with distinct mechanisms of action (gut-selective anti-integrin Vedolizumab + systemic anti-IL-12/23 Ustekinumab) is an emerging off-label strategy for severe, medically refractory Crohn\'s disease when monotherapy fails.',
        type: 'summary'
      },
      {
        id: 'sec-103-2',
        title: 'Efficacy & Safety Findings',
        content: 'Recent cohort studies indicate a clinical response rate of approximately 65-70% in multi-drug resistant patients. However, safety data is limited to small observational cohorts.\n\n* **Infection Risk:** The overall rate of serious infections is reported at 7.4 per 100 patient-years.\n* **Malignancy:** No significant short-term increase in malignancy has been observed, though long-term data (>3 years) is lacking.',
        type: 'evidence_table'
      }
    ],
    citations: [INITIAL_CITATIONS[4]]
  }
];

export const INITIAL_VALIDATION_QUEUE: ValidationQueueItem[] = [
  {
    id: 'vq-201',
    queryId: 'query-102',
    queryText: 'Management protocol for suspected Immune Checkpoint Inhibitor (ICI) induced myocarditis in a patient receiving Pembrolizumab for metastatic melanoma.',
    category: 'Oncology',
    aiSummary: 'Recommends immediate permanent cessation of Pembrolizumab and IV Methylprednisolone 1,000mg/day. Lists Abatacept and Alemtuzumab for steroid-refractory cases.',
    confidenceScore: 94,
    submittedAt: '2026-03-24T16:15:00Z',
    assignedValidator: 'Dr. Marcus Vance',
    status: 'Pending',
    discrepancyRisk: 'Low',
    citationsCount: 1,
    ragSources: ['Pinecone Vector Index: oncology_guidelines_2025_v2', 'PubMed Central Ingestion Pipeline']
  },
  {
    id: 'vq-202',
    queryId: 'query-103',
    queryText: 'What are the risks and clinical protocols for combining Vedolizumab and Ustekinumab in severe refractory Crohn\'s disease?',
    category: 'Immunology',
    aiSummary: 'Highlights 65-70% clinical response rate in refractory Crohn\'s. Mentions serious infection rate of 7.4 per 100 patient-years.',
    confidenceScore: 88,
    submittedAt: '2026-03-23T09:11:00Z',
    assignedValidator: 'Dr. Sarah Jenkins',
    status: 'In Review',
    discrepancyRisk: 'Medium',
    citationsCount: 1,
    ragSources: ['Elasticsearch Clinical Trials Corpus', 'IBD Specialist Consensus Database']
  },
  {
    id: 'vq-203',
    queryId: 'query-104',
    queryText: 'Pediatric dosing and safety profile of GLP-1 receptor agonists for adolescent obesity with comorbid hepatic steatosis.',
    category: 'Pediatrics',
    aiSummary: 'Suggests Liraglutide 3.0mg daily or Semaglutide 2.4mg weekly for adolescents 12 years and older with BMI ≥95th percentile. Notes improvements in ALT and liver fat content.',
    confidenceScore: 82,
    submittedAt: '2026-03-24T11:05:00Z',
    assignedValidator: 'Unassigned',
    status: 'Pending',
    discrepancyRisk: 'High',
    citationsCount: 3,
    ragSources: ['Pediatric Endocrine Society Guidelines 2024', 'STEP TEENS Clinical Trial Repository']
  },
  {
    id: 'vq-204',
    queryId: 'query-105',
    queryText: 'Evaluation of seizure recurrence risk following a first unprovoked tonic-clonic seizure in a 24-year-old with normal EEG and MRI.',
    category: 'Neurology',
    aiSummary: 'Estimates 2-year recurrence risk at 21-27%. Recommends withholding antiepileptic drug (AED) therapy unless high-risk occupational factors exist, advising lifestyle modifications and seizure precautions.',
    confidenceScore: 97,
    submittedAt: '2026-03-22T15:40:00Z',
    assignedValidator: 'Dr. Aris Thorne',
    status: 'Pending',
    discrepancyRisk: 'Low',
    citationsCount: 2,
    ragSources: ['AAN/AES Practice Parameter Update', 'Epilepsia Journal Database']
  }
];

export const ANALYTICS_DATA: AnalyticsMetric[] = [
  { name: 'Cardiology', queries: 1420, validated: 1380, accuracy: 98.2 },
  { name: 'Oncology', queries: 1150, validated: 1090, accuracy: 96.5 },
  { name: 'Neurology', queries: 890, validated: 840, accuracy: 97.1 },
  { name: 'Immunology', queries: 640, validated: 590, accuracy: 94.8 },
  { name: 'Pediatrics', queries: 720, validated: 650, accuracy: 95.3 },
  { name: 'Endocrinology', queries: 1080, validated: 1040, accuracy: 97.9 }
];

export const PERFORMANCE_METRICS = [
  { time: '08:00', latencyMs: 240, ragHitRate: 98.5, activeNodes: 12 },
  { time: '10:00', latencyMs: 285, ragHitRate: 99.1, activeNodes: 14 },
  { time: '12:00', latencyMs: 340, ragHitRate: 97.8, activeNodes: 16 },
  { time: '14:00', latencyMs: 310, ragHitRate: 98.4, activeNodes: 15 },
  { time: '16:00', latencyMs: 265, ragHitRate: 98.9, activeNodes: 12 },
  { time: '18:00', latencyMs: 220, ragHitRate: 99.4, activeNodes: 10 },
];

export interface MonorepoNode {
  name: string;
  type: 'dir' | 'file';
  description?: string;
  tech?: string;
  children?: MonorepoNode[];
}

export const MONOREPO_TREE: MonorepoNode[] = [
  {
    name: 'apps',
    type: 'dir',
    description: 'Core microservices and applications',
    children: [
      {
        name: 'frontend',
        type: 'dir',
        description: 'Next.js 15 App Router Frontend',
        tech: 'Next.js, React 19, TailwindCSS, ShadCN UI, Zustand',
        children: [
          { name: 'src/app', type: 'dir', description: 'Next.js App Router (auth, dashboard, api)' },
          { name: 'src/features', type: 'dir', description: 'Feature-based modules (auth, medical-query, ai-response, validation, citations)' },
          { name: 'src/components', type: 'dir', description: 'Shared UI design system, charts, markdown renderers' },
          { name: 'src/services', type: 'dir', description: 'API, query, validation services' },
          { name: 'src/i18n', type: 'dir', description: 'Multi-language support (en, am, ar)' }
        ]
      },
      {
        name: 'backend',
        type: 'dir',
        description: 'Express Backend API & RAG Orchestration',
        tech: 'Express.js, TypeScript, Prisma, PostgreSQL',
        children: [
          { name: 'src/controllers', type: 'dir', description: 'Query, validation, auth, citation controllers' },
          { name: 'src/services', type: 'dir', description: 'RAG orchestration, analytics, notification services' },
          { name: 'src/ai', type: 'dir', description: 'RAG pipeline, embeddings, prompts, Pinecone integration' },
          { name: 'prisma/schema.prisma', type: 'file', description: 'Database schema for Users, Queries, Citations, Audit Logs' }
        ]
      },
      {
        name: 'ai-services',
        type: 'dir',
        description: 'Python AI/RAG Microservice',
        tech: 'Python, FastAPI, LangChain, Pinecone, GPT-4o',
        children: [
          { name: 'app/rag', type: 'dir', description: 'Advanced RAG retrieval, reranking, and summarization pipelines' },
          { name: 'app/embeddings', type: 'dir', description: 'Chunking, embedding generation, vector store synchronization' },
          { name: 'app/validation', type: 'dir', description: 'Automated medical fact-checking and contradiction detection' }
        ]
      }
    ]
  },
  {
    name: 'packages',
    type: 'dir',
    description: 'Shared monorepo libraries',
    children: [
      { name: 'ui', type: 'dir', description: 'Shared UI components & themes' },
      { name: 'types', type: 'dir', description: 'Shared TypeScript definitions (auth, query, validation, citation)' },
      { name: 'constants', type: 'dir', description: 'Shared medical constants, error codes, config' },
      { name: 'eslint-config', type: 'dir', description: 'Shared enterprise linting rules' },
      { name: 'tsconfig', type: 'dir', description: 'Shared TypeScript base configs' }
    ]
  },
  {
    name: 'infrastructure',
    type: 'dir',
    description: 'Deployment & Containerization',
    children: [
      { name: 'docker', type: 'dir', description: 'Microservice Dockerfiles (frontend, backend, ai-services, nginx)' },
      { name: 'kubernetes', type: 'dir', description: 'K8s manifests for enterprise auto-scaling' },
      { name: 'terraform', type: 'dir', description: 'AWS Infrastructure as Code' }
    ]
  },
  {
    name: 'docs',
    type: 'dir',
    description: 'System specifications & compliance',
    children: [
      { name: 'srs', type: 'dir', description: 'Software Requirements Specification' },
      { name: 'architecture', type: 'dir', description: 'High-level architecture & RAG flow diagrams' },
      { name: 'compliance', type: 'dir', description: 'HIPAA & Medical AI Safety Compliance frameworks' }
    ]
  },
  { name: 'turbo.json', type: 'file', description: 'Monorepo build orchestration' },
  { name: 'pnpm-workspace.yaml', type: 'file', description: 'Workspace package management' },
  { name: 'docker-compose.yml', type: 'file', description: 'Local multi-container dev environment orchestration' }
];

export const MEDICAL_CATEGORIES = [
  'All Categories',
  'Cardiology',
  'Oncology',
  'Neurology',
  'Immunology',
  'Pediatrics',
  'Endocrinology',
];

export const MOCK_USER_ROLES = [
  { id: 'role-1', title: 'Chief Medical AI Validator', name: 'Dr. Marcus Vance', department: 'Cardiology & AI Ethics', badge: 'Admin / Lead Validator' },
  { id: 'role-2', title: 'Clinical AI Validator', name: 'Dr. Sarah Jenkins', department: 'Gastroenterology & Immunology', badge: 'Senior Validator' },
  { id: 'role-3', title: 'General Practitioner', name: 'Dr. Aris Thorne', department: 'Family Medicine', badge: 'Clinician' },
  { id: 'role-4', title: 'Medical Resident', name: 'Dr. Elena Rostova', department: 'Internal Medicine', badge: 'Junior Clinician' },
];

export const MOCK_LANGUAGES = [
  { code: 'en', name: 'English (US)', flag: '🇺🇸' },
  { code: 'am', name: 'አማርኛ (Amharic)', flag: '🇪🇹' },
  { code: 'ar', name: 'العربية (Arabic)', flag: '🇸🇦' },
];

export const MOCK_TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    'app.title': 'NileoPedia',
    'app.subtitle': 'AI-Powered Medical Knowledge Platform',
    'nav.query': 'Medical Query',
    'nav.ai_response': 'AI Response Viewer',
    'nav.validation': 'Validation Dashboard',
    'nav.citations': 'Citations Library',
    'nav.analytics': 'Analytics & Performance',
    'nav.history': 'Query History',
    'nav.monorepo': 'Monorepo Architecture',
    'nav.settings': 'System Settings',
    'query.placeholder': 'Ask a medical question (e.g., SGLT2i protocol in HFpEF with CKD Stage 4)...',
    'query.submit': 'Submit Medical Query',
    'query.urgency': 'Urgency Level',
    'query.category': 'Medical Domain',
    'query.patient_context': 'Optional Patient Context / Vitals',
    'query.suggestions': 'Sample Clinical Queries:',
    'ai.confidence': 'AI Confidence Score',
    'ai.status.validated': 'Validated by Medical Lead',
    'ai.status.pending': 'Pending Clinical Validation',
    'ai.status.revision': 'Requires Clinical Revision',
    'val.queue': 'Pending Validation Queue',
    'val.approve': 'Approve & Publish Response',
    'val.reject': 'Reject / Flag Discrepancy',
    'val.request_rev': 'Request AI Revision',
    'val.notes': 'Validator Clinical Notes',
    'cit.title': 'RAG Source Citations & Evidence',
    'cit.relevance': 'Relevance Match',
    'stats.total_queries': 'Total Queries Processed',
    'stats.validated_rate': 'Clinical Validation Rate',
    'stats.rag_accuracy': 'RAG Retrieval Accuracy',
    'stats.avg_latency': 'Average Pipeline Latency',
    'settings.title': 'Platform Configuration & Settings',
  },
  am: {
    'app.title': 'ናይሊዮፔዲያ (NileoPedia)',
    'app.subtitle': 'በአርቲፊሻል ኢንተለጀንስ የተደገፈ የህክምና እውቀት መድረክ',
    'nav.query': 'የህክምና ጥያቄ ማቅረቢያ',
    'nav.ai_response': 'የ AI ምላሽ መመልከቻ',
    'nav.validation': 'የህክምና ማረጋገጫ ዳሽቦርድ',
    'nav.citations': 'የማስረጃ ምንጮች (Citations)',
    'nav.analytics': 'ትንታኔ እና አፈጻጸም',
    'nav.history': 'የጥያቄዎች ታሪክ',
    'nav.monorepo': 'የሞኖሬፖ አወቃቀር',
    'nav.settings': 'የስርዓት ማስተካከያዎች',
    'query.placeholder': 'የህክምና ጥያቄ ይጠይቁ (ለምሳሌ፡ ስለ SGLT2i አጠቃቀም በ HFpEF)...',
    'query.submit': 'የህክምና ጥያቄ አስገባ',
    'query.urgency': 'የአስቸኳይነት ደረጃ',
    'query.category': 'የህክምና ዘርፍ',
    'query.patient_context': 'የታካሚው ሁኔታ / ተጨማሪ መረጃ',
    'query.suggestions': 'የናሙና ክሊኒካዊ ጥያቄዎች፡',
    'ai.confidence': 'የ AI እርግጠኝነት ደረጃ',
    'ai.status.validated': 'በህክምና ባለሙያ የተረጋገጠ',
    'ai.status.pending': 'ማረጋገጫ በመጠባበቅ ላይ',
    'ai.status.revision': 'ክሊኒካዊ እርማት ይፈልጋል',
    'val.queue': 'የማረጋገጫ ተራ ዝርዝር',
    'val.approve': 'አጽድቅ እና አሳትም',
    'val.reject': 'ውድቅ አድርግ / ስህተት አስታውቅ',
    'val.request_rev': 'የ AI እርማት ጠይቅ',
    'val.notes': 'የአረጋጋጭ ክሊኒካዊ ማስታወሻዎች',
    'cit.title': 'የ RAG ማስረጃዎች እና ምንጮች',
    'cit.relevance': 'የተዛማጅነት መጠን',
    'stats.total_queries': 'አጠቃላይ የተስተናገዱ ጥያቄዎች',
    'stats.validated_rate': 'የክሊኒካዊ ማረጋገጫ ምጣኔ',
    'stats.rag_accuracy': 'የ RAG መረጃ ትክክለኛነት',
    'stats.avg_latency': 'አማካይ የቆይታ ጊዜ',
    'settings.title': 'የመድረክ ማዋቀር እና ማስተካከያዎች',
  },
  ar: {
    'app.title': 'نيليوبيديا (NileoPedia)',
    'app.subtitle': 'منصة المعرفة الطبية المدعومة بالذكاء الاصطناعي',
    'nav.query': 'الاستعلام الطبي',
    'nav.ai_response': 'عرض استجابة الذكاء الاصطناعي',
    'nav.validation': 'لوحة التحقق الطبي',
    'nav.citations': 'مكتبة المراجع والأدلة',
    'nav.analytics': 'التحليلات والأداء',
    'nav.history': 'سجل الاستعلامات',
    'nav.monorepo': 'هيكل المونوريبو (Monorepo)',
    'nav.settings': 'إعدادات النظام',
    'query.placeholder': 'اطرح سؤالاً طبياً (مثل بروتوكول SGLT2i في حالات HFpEF)...',
    'query.submit': 'إرسال الاستعلام الطبي',
    'query.urgency': 'مستوى الاستعجال',
    'query.category': 'المجال الطبي',
    'query.patient_context': 'سياق المريض / العلامات الحيوية (اختياري)',
    'query.suggestions': 'نماذج استعلامات سريرية:',
    'ai.confidence': 'درجة ثقة الذكاء الاصطناعي',
    'ai.status.validated': 'تم التحقق من قبل قائد طبي',
    'ai.status.pending': 'في انتظار التحقق السريري',
    'ai.status.revision': 'يتطلب مراجعة سريرية',
    'val.queue': 'قائمة انتظار التحقق',
    'val.approve': 'اعتماد ونشر الاستجابة',
    'val.reject': 'رفض / الإبلاغ عن تعارض',
    'val.request_rev': 'طلب مراجعة الذكاء الاصطناعي',
    'val.notes': 'ملاحظات المدقق السريري',
    'cit.title': 'مراجع وأدلة RAG',
    'cit.relevance': 'نسبة التطابق',
    'stats.total_queries': 'إجمالي الاستعلامات المعالجة',
    'stats.validated_rate': 'معدل التحقق السريري',
    'stats.rag_accuracy': 'دقة استرجاع RAG',
    'stats.avg_latency': 'متوسط زمن الوصول',
    'settings.title': 'تكوين المنصة والإعدادات',
  }
};
