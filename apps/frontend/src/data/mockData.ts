import { User, Query, AIResponse, Activity, Citation, CategoryStat } from '../types';

export const currentUser: User = {
  id: '1',
  name: 'Dr. Sarah Johnson',
  email: 'sarah.johnson@nileopedia.com',
  role: 'user',
  title: 'Medical User',
};

export const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'query_submitted',
    title: 'New query submitted',
    description: '"Management of Type 2 Diabetes in Elderly Patients"',
    status: 'pending',
    timestamp: '2 minutes ago',
  },
  {
    id: '2',
    type: 'response_validated',
    title: 'Response validated',
    description: '"Hypertension Guidelines 2024"',
    status: 'approved',
    timestamp: '15 minutes ago',
  },
  {
    id: '3',
    type: 'query_rejected',
    title: 'Query rejected',
    description: '"Alternative treatment for cancer"',
    status: 'rejected',
    timestamp: '1 hour ago',
  },
  {
    id: '4',
    type: 'user_registered',
    title: 'New user registered',
    description: 'Dr. Michael Johnson joined the platform',
    status: 'info',
    timestamp: '2 hours ago',
  },
];

export const mockCitations: Citation[] = [
  {
    id: '1',
    title: 'American Diabetes Association. Standards of Care 2024',
    authors: 'American Diabetes Association',
    journal: 'Diabetes Care',
    year: 2024,
    volume: '47(Suppl 1)',
    pages: 'S1-S186',
    type: 'Guideline',
    organization: 'ADA',
  },
  {
    id: '2',
    title: 'European Diabetes Working Party. Clinical Guidelines 2023',
    authors: 'European Diabetes Working Party',
    journal: 'Diabetes Research and Clinical Practice',
    year: 2023,
    volume: '198',
    pages: '110532',
    type: 'Guideline',
    organization: 'EASD',
  },
  {
    id: '3',
    title: 'Management of Diabetes in Older Adults',
    authors: 'Diabetes Care',
    journal: 'Diabetes Care',
    year: 2023,
    volume: '46(5)',
    pages: '926-938',
    type: 'Review',
  },
  {
    id: '4',
    title: 'Management of diabetes in older people',
    authors: 'Sinclair A.J, Dunning T, Colagiuri S',
    journal: 'Lancet Diabetes Endocrinol',
    year: 2022,
    volume: '10(5)',
    pages: '341-350',
    type: 'Expert Opinion',
  },
];

export const mockResponse: AIResponse = {
  id: 'resp-1',
  queryId: 'q-1',
  title: 'What are the latest evidence-based recommendations for managing Type 2 Diabetes in elderly patients?',
  summary: 'Management of Type 2 Diabetes in elderly patients requires individualized treatment goals considering comorbidities, life expectancy, and risk of hypoglycemia. Current guidelines recommend:',
  keyFindings: [
    'HbA1c target of < 7.5–8.0% for healthy elderly patients',
    'Less stringent targets (< 8.5–9.0%) for those with complex health issues',
    'Metformin as first-line therapy if eGFR > 30 ml/min/1.73m²',
    'Avoid sulfonylureas due to hypoglycemia risk',
    'Consider SGLT2 inhibitors for patients with CVD or CKD',
    'Regular monitoring and patient education are essential',
  ],
  detailedExplanation: `Glycemic targets should be individualized based on the patient's overall health status:

• Healthy elderly (few comorbidities, intact cognitive function): HbA1c < 7.5%
• Complex/intermediate health: HbA1c < 8.0%
• Very complex/poor health: HbA1c < 8.5–9.0%

Metformin remains the first-line therapy but requires dose adjustment based on renal function. SGLT2 inhibitors and GLP-1 receptor agonists are preferred for patients with cardiovascular disease or chronic kidney disease.

Hypoglycemia prevention is critical in elderly patients. Sulfonylureas and insulin should be used with extreme caution. Regular monitoring of renal function, cognitive status, and functional capacity is essential for ongoing treatment decisions.`,
  citations: mockCitations,
  status: 'in_review',
  confidenceScore: 92,
  model: 'Llama-3.3-70b + RAG',
  generatedAt: 'May 29, 2025 10:30 AM',
  assignedTo: 'Dr. Emily Davis',
  dueDate: 'May 31, 2025',
  tags: ['Type 2 Diabetes', 'Elderly Care', 'Treatment Guidelines', 'Evidence-Based', 'Follow-up'],
  source: 'real',
  documentsUsed: 3,
  embeddingModel: 'all-MiniLM-L6-v2',
  processingTime: 1250,
};

export const mockQueries: Query[] = [
  {
    id: 'q-1',
    question: 'What are the latest guidelines for AF management?',
    category: 'Cardiology',
    status: 'approved',
    createdAt: '2 min ago',
    updatedAt: '2 min ago',
    userId: '1',
  },
  {
    id: 'q-2',
    question: 'How to manage acute asthma in children?',
    category: 'Pediatrics',
    status: 'pending',
    createdAt: '15 min ago',
    updatedAt: '15 min ago',
    userId: '1',
  },
  {
    id: 'q-3',
    question: 'Best practices for wound healing?',
    category: 'Dermatology',
    status: 'approved',
    createdAt: '1 hour ago',
    updatedAt: '1 hour ago',
    userId: '1',
  },
];

export const mockCategoryStats: CategoryStat[] = [
  { name: 'Cardiology', value: 32, color: '#2563EB' },
  { name: 'Endocrinology', value: 24, color: '#3B82F6' },
  { name: 'Neurology', value: 18, color: '#60A5FA' },
  { name: 'Pediatrics', value: 14, color: '#93C5FD' },
  { name: 'Other', value: 12, color: '#BFDBFE' },
];

export const mockReviewQueue = [
  {
    id: 'r-1',
    title: 'Management of Type 2 Diabetes in Elderly Patients',
    category: 'Cardiology',
    submittedAt: '2 min ago',
    dueDate: 'May 31, 2025',
    priority: 'high',
    status: 'pending',
  },
  {
    id: 'r-2',
    title: 'Alternative treatment for cancer',
    category: 'Oncology',
    submittedAt: '1 hour ago',
    dueDate: 'May 30, 2025',
    priority: 'high',
    status: 'pending',
  },
  {
    id: 'r-3',
    title: 'Hypertension Guidelines 2024',
    category: 'Cardiology',
    submittedAt: '2 hours ago',
    dueDate: 'May 30, 2025',
    priority: 'medium',
    status: 'pending',
  },
  {
    id: 'r-4',
    title: 'COVID-19 Treatment Protocols',
    category: 'Infectious Disease',
    submittedAt: '2 hours ago',
    dueDate: 'May 31, 2025',
    priority: 'medium',
    status: 'pending',
  },
];
