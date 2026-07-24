export interface EvaluationQuestion {
  id: string;
  query: string;
  category: string;
  specialty: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  expectedDiseases: string[];
  expectedTerms: string[];
  expectedSpecialty: string;
  minConfidence: number;
  maxLatencyMs: number;
  requiresCitation: boolean;
  requiresSynonymExpansion: boolean;
  requiresAcronymExpansion: boolean;
  metadata: {
    icd10Codes?: string[];
    snomedCodes?: string[];
    meshTerms?: string[];
    keywords?: string[];
  };
}

export interface EvaluationResult {
  questionId: string;
  query: string;
  specialty: string;
  passed: boolean;
  score: number;
  metrics: {
    precisionAt5: number;
    recallAt5: number;
    mrr: number;
    map: number;
    ndcg: number;
    hitRate: number;
    contextRecall: number;
    faithfulness: number;
    groundedness: number;
    citationAccuracy: number;
    answerCompleteness: number;
    evidenceCoverage: number;
    medicalAccuracy: number;
  };
  details: {
    retrievedCount: number;
    relevantCount: number;
    topScore: number;
    confidence: number;
    latencyMs: number;
    synonymsExpanded: string[];
    acronymsExpanded: string[];
    citations: Array<{ title: string; source: string; authors: string[]; year?: number }>;
    chunks: Array<{ text: string; score: number }>;
    errors: string[];
  };
}

export interface EvaluationReport {
  totalQuestions: number;
  passedQuestions: number;
  failedQuestions: number;
  averageScore: number;
  specialtyBreakdown: Record<string, { total: number; passed: number; avgScore: number }>;
  difficultyBreakdown: Record<string, { total: number; passed: number; avgScore: number }>;
  metrics: {
    avgPrecisionAt5: number;
    avgRecallAt5: number;
    avgMRR: number;
    avgMAP: number;
    avgNDCG: number;
    avgHitRate: number;
    avgContextRecall: number;
    avgFaithfulness: number;
    avgGroundedness: number;
    avgCitationAccuracy: number;
    avgAnswerCompleteness: number;
    avgEvidenceCoverage: number;
    avgMedicalAccuracy: number;
  };
  latency: {
    avgLatencyMs: number;
    p50LatencyMs: number;
    p95LatencyMs: number;
    p99LatencyMs: number;
  };
  topFailures: Array<{ query: string; reason: string }>;
  recommendations: string[];
}

export const EVALUATION_QUESTIONS: EvaluationQuestion[] = [
  {
    id: 'HTN-001',
    query: 'What is hypertension?',
    category: 'cardiovascular',
    specialty: 'cardiology',
    difficulty: 'easy',
    expectedDiseases: ['hypertension'],
    expectedTerms: ['blood pressure', 'hypertension', 'high blood pressure'],
    expectedSpecialty: 'cardiology',
    minConfidence: 0.4,
    maxLatencyMs: 15000,
    requiresCitation: true,
    requiresSynonymExpansion: false,
    requiresAcronymExpansion: false,
    metadata: {
      icd10Codes: ['I10'],
      snomedCodes: ['38341003'],
      meshTerms: ['Hypertension'],
      keywords: ['blood pressure', 'hypertensive', 'cardiovascular']
    }
  },
  {
    id: 'HTN-002',
    query: 'High blood pressure',
    category: 'cardiovascular',
    specialty: 'cardiology',
    difficulty: 'easy',
    expectedDiseases: ['hypertension'],
    expectedTerms: ['hypertension', 'blood pressure', 'high blood pressure'],
    expectedSpecialty: 'cardiology',
    minConfidence: 0.4,
    maxLatencyMs: 15000,
    requiresCitation: true,
    requiresSynonymExpansion: true,
    requiresAcronymExpansion: false,
    metadata: {
      icd10Codes: ['I10'],
      keywords: ['hypertension', 'antihypertensive']
    }
  },
  {
    id: 'HTN-003',
    query: 'HTN',
    category: 'cardiovascular',
    specialty: 'cardiology',
    difficulty: 'medium',
    expectedDiseases: ['hypertension'],
    expectedTerms: ['hypertension'],
    expectedSpecialty: 'cardiology',
    minConfidence: 0.3,
    maxLatencyMs: 15000,
    requiresCitation: true,
    requiresSynonymExpansion: false,
    requiresAcronymExpansion: true,
    metadata: {
      keywords: ['hypertension', 'blood pressure']
    }
  },
  {
    id: 'HTN-004',
    query: 'What are the symptoms of hypertension?',
    category: 'cardiovascular',
    specialty: 'cardiology',
    difficulty: 'easy',
    expectedDiseases: ['hypertension'],
    expectedTerms: ['headache', 'dizziness', 'blood pressure'],
    expectedSpecialty: 'cardiology',
    minConfidence: 0.4,
    maxLatencyMs: 15000,
    requiresCitation: true,
    requiresSynonymExpansion: false,
    requiresAcronymExpansion: false,
    metadata: {
      meshTerms: ['Hypertension', 'Headache', 'Dizziness']
    }
  },
  {
    id: 'DM-001',
    query: 'What is diabetes mellitus?',
    category: 'endocrine',
    specialty: 'endocrinology',
    difficulty: 'easy',
    expectedDiseases: ['diabetes mellitus'],
    expectedTerms: ['diabetes', 'glucose', 'insulin', 'hyperglycemia'],
    expectedSpecialty: 'endocrinology',
    minConfidence: 0.5,
    maxLatencyMs: 15000,
    requiresCitation: true,
    requiresSynonymExpansion: false,
    requiresAcronymExpansion: false,
    metadata: {
      icd10Codes: ['E11.9'],
      meshTerms: ['Diabetes Mellitus', 'Hyperglycemia']
    }
  },
  {
    id: 'DM-002',
    query: 'Type 2 diabetes',
    category: 'endocrine',
    specialty: 'endocrinology',
    difficulty: 'easy',
    expectedDiseases: ['type 2 diabetes'],
    expectedTerms: ['diabetes', 'type 2', 'insulin resistance', 'T2DM'],
    expectedSpecialty: 'endocrinology',
    minConfidence: 0.5,
    maxLatencyMs: 15000,
    requiresCitation: true,
    requiresSynonymExpansion: false,
    requiresAcronymExpansion: false,
    metadata: {
      icd10Codes: ['E11.9'],
      keywords: ['type 2 diabetes', 'T2DM', 'insulin resistance']
    }
  },
  {
    id: 'DM-003',
    query: 'What are the symptoms of diabetes?',
    category: 'endocrine',
    specialty: 'endocrinology',
    difficulty: 'easy',
    expectedDiseases: ['diabetes mellitus'],
    expectedTerms: ['polyuria', 'polydipsia', 'polyphagia', 'weight loss', 'fatigue'],
    expectedSpecialty: 'endocrinology',
    minConfidence: 0.4,
    maxLatencyMs: 15000,
    requiresCitation: true,
    requiresSynonymExpansion: false,
    requiresAcronymExpansion: false,
    metadata: {
      meshTerms: ['Diabetes Mellitus', 'Polyuria', 'Polydipsia', 'Polyphagia']
    }
  },
  {
    id: 'DM-004',
    query: 'Diabetes treatment guidelines',
    category: 'endocrine',
    specialty: 'endocrinology',
    difficulty: 'medium',
    expectedDiseases: ['diabetes mellitus'],
    expectedTerms: ['metformin', 'lifestyle', 'HbA1c', 'insulin', 'glucose'],
    expectedSpecialty: 'endocrinology',
    minConfidence: 0.5,
    maxLatencyMs: 15000,
    requiresCitation: true,
    requiresSynonymExpansion: false,
    requiresAcronymExpansion: false,
    metadata: {
      keywords: ['diabetes treatment', 'metformin', 'insulin therapy', 'glycemic control']
    }
  },
  {
    id: 'MI-001',
    query: 'What is a heart attack?',
    category: 'cardiovascular',
    specialty: 'cardiology',
    difficulty: 'easy',
    expectedDiseases: ['myocardial infarction'],
    expectedTerms: ['myocardial infarction', 'heart attack', 'MI', 'coronary', 'chest pain'],
    expectedSpecialty: 'cardiology',
    minConfidence: 0.5,
    maxLatencyMs: 15000,
    requiresCitation: true,
    requiresSynonymExpansion: false,
    requiresAcronymExpansion: false,
    metadata: {
      icd10Codes: ['I21.9'],
      meshTerms: ['Myocardial Infarction', 'Acute Coronary Syndrome']
    }
  },
  {
    id: 'MI-002',
    query: 'Myocardial infarction',
    category: 'cardiovascular',
    specialty: 'cardiology',
    difficulty: 'medium',
    expectedDiseases: ['myocardial infarction'],
    expectedTerms: ['heart attack', 'MI', 'coronary', 'chest pain', 'STEMI', 'NSTEMI'],
    expectedSpecialty: 'cardiology',
    minConfidence: 0.5,
    maxLatencyMs: 15000,
    requiresCitation: true,
    requiresSynonymExpansion: false,
    requiresAcronymExpansion: false,
    metadata: {
      icd10Codes: ['I21.9', 'I22.9'],
      snomedCodes: ['22298006', '57054005']
    }
  },
  {
    id: 'MI-003',
    query: 'MI treatment',
    category: 'cardiovascular',
    specialty: 'cardiology',
    difficulty: 'medium',
    expectedDiseases: ['myocardial infarction'],
    expectedTerms: ['PCI', 'stent', 'thrombolysis', 'aspirin', 'clopidogrel', 'heparin'],
    expectedSpecialty: 'cardiology',
    minConfidence: 0.4,
    maxLatencyMs: 15000,
    requiresCitation: true,
    requiresSynonymExpansion: false,
    requiresAcronymExpansion: true,
    metadata: {
      keywords: ['myocardial infarction treatment', 'PCI', 'STEMI', 'NSTEMI']
    }
  },
  {
    id: 'STK-001',
    query: 'What is a stroke?',
    category: 'neurology',
    specialty: 'neurology',
    difficulty: 'easy',
    expectedDiseases: ['stroke'],
    expectedTerms: ['stroke', 'cerebrovascular', 'brain', 'ischemic', 'hemorrhagic'],
    expectedSpecialty: 'neurology',
    minConfidence: 0.5,
    maxLatencyMs: 15000,
    requiresCitation: true,
    requiresSynonymExpansion: false,
    requiresAcronymExpansion: false,
    metadata: {
      icd10Codes: ['I63.9'],
      meshTerms: ['Stroke', 'Cerebrovascular Accident']
    }
  },
  {
    id: 'STK-002',
    query: 'CVA',
    category: 'neurology',
    specialty: 'neurology',
    difficulty: 'medium',
    expectedDiseases: ['stroke'],
    expectedTerms: ['stroke', 'cerebrovascular', 'brain'],
    expectedSpecialty: 'neurology',
    minConfidence: 0.4,
    maxLatencyMs: 15000,
    requiresCitation: true,
    requiresSynonymExpansion: false,
    requiresAcronymExpansion: true,
    metadata: {
      keywords: ['cerebrovascular accident', 'stroke', 'CVA']
    }
  },
  {
    id: 'STK-003',
    query: 'Stroke symptoms and treatment',
    category: 'neurology',
    specialty: 'neurology',
    difficulty: 'medium',
    expectedDiseases: ['stroke'],
    expectedTerms: ['FAST', 'weakness', 'speech', 'thrombolysis', 'rehabilitation'],
    expectedSpecialty: 'neurology',
    minConfidence: 0.4,
    maxLatencyMs: 15000,
    requiresCitation: true,
    requiresSynonymExpansion: false,
    requiresAcronymExpansion: false,
    metadata: {
      meshTerms: ['Stroke', 'Stroke Rehabilitation', 'Thrombolytic Therapy']
    }
  },
  {
    id: 'AST-001',
    query: 'What is asthma?',
    category: 'respiratory',
    specialty: 'pulmonology',
    difficulty: 'easy',
    expectedDiseases: ['asthma'],
    expectedTerms: ['asthma', 'bronchospasm', 'wheeze', 'inhaler', 'bronchodilator'],
    expectedSpecialty: 'pulmonology',
    minConfidence: 0.5,
    maxLatencyMs: 15000,
    requiresCitation: true,
    requiresSynonymExpansion: false,
    requiresAcronymExpansion: false,
    metadata: {
      icd10Codes: ['J45.909'],
      meshTerms: ['Asthma', 'Bronchial Spasm']
    }
  },
  {
    id: 'AST-002',
    query: 'Asthma exacerbation management',
    category: 'respiratory',
    specialty: 'pulmonology',
    difficulty: 'medium',
    expectedDiseases: ['asthma'],
    expectedTerms: ['exacerbation', 'corticosteroid', 'bronchodilator', 'oxygen', 'nebulizer'],
    expectedSpecialty: 'pulmonology',
    minConfidence: 0.4,
    maxLatencyMs: 15000,
    requiresCitation: true,
    requiresSynonymExpansion: false,
    requiresAcronymExpansion: false,
    metadata: {
      keywords: ['asthma exacerbation', 'status asthmaticus', 'bronchodilator']
    }
  },
  {
    id: 'COP-001',
    query: 'What is COPD?',
    category: 'respiratory',
    specialty: 'pulmonology',
    difficulty: 'easy',
    expectedDiseases: ['COPD'],
    expectedTerms: ['COPD', 'chronic obstructive pulmonary disease', 'emphysema', 'bronchitis'],
    expectedSpecialty: 'pulmonology',
    minConfidence: 0.5,
    maxLatencyMs: 15000,
    requiresCitation: true,
    requiresSynonymExpansion: false,
    requiresAcronymExpansion: true,
    metadata: {
      icd10Codes: ['J44.9'],
      meshTerms: ['Pulmonary Disease, Chronic Obstructive', 'Emphysema']
    }
  },
  {
    id: 'COP-002',
    query: 'Chronic obstructive pulmonary disease',
    category: 'respiratory',
    specialty: 'pulmonology',
    difficulty: 'medium',
    expectedDiseases: ['COPD'],
    expectedTerms: ['COPD', 'emphysema', 'bronchitis', 'smoking', 'bronchodilator'],
    expectedSpecialty: 'pulmonology',
    minConfidence: 0.5,
    maxLatencyMs: 15000,
    requiresCitation: true,
    requiresSynonymExpansion: false,
    requiresAcronymExpansion: false,
    metadata: {
      keywords: ['COPD', 'chronic bronchitis', 'emphysema', 'lung disease']
    }
  },
  {
    id: 'MAL-001',
    query: 'What is malaria?',
    category: 'infectious',
    specialty: 'infectious disease',
    difficulty: 'easy',
    expectedDiseases: ['malaria'],
    expectedTerms: ['malaria', 'plasmodium', 'fever', 'parasite', 'mosquito'],
    expectedSpecialty: 'infectious disease',
    minConfidence: 0.5,
    maxLatencyMs: 15000,
    requiresCitation: true,
    requiresSynonymExpansion: false,
    requiresAcronymExpansion: false,
    metadata: {
      icd10Codes: ['B50.9'],
      meshTerms: ['Malaria', 'Plasmodium']
    }
  },
  {
    id: 'MAL-002',
    query: 'Malaria symptoms and treatment',
    category: 'infectious',
    specialty: 'infectious disease',
    difficulty: 'medium',
    expectedDiseases: ['malaria'],
    expectedTerms: ['fever', 'chills', 'sweating', 'chloroquine', 'artemisinin', 'mosquito'],
    expectedSpecialty: 'infectious disease',
    minConfidence: 0.4,
    maxLatencyMs: 15000,
    requiresCitation: true,
    requiresSynonymExpansion: false,
    requiresAcronymExpansion: false,
    metadata: {
      keywords: ['malaria treatment', 'antimalarial', 'plasmodium', 'fever']
    }
  },
  {
    id: 'TB-001',
    query: 'What is tuberculosis?',
    category: 'infectious',
    specialty: 'infectious disease',
    difficulty: 'easy',
    expectedDiseases: ['tuberculosis'],
    expectedTerms: ['tuberculosis', 'TB', 'mycobacterium', 'cough', 'bacteria'],
    expectedSpecialty: 'infectious disease',
    minConfidence: 0.5,
    maxLatencyMs: 15000,
    requiresCitation: true,
    requiresSynonymExpansion: false,
    requiresAcronymExpansion: true,
    metadata: {
      icd10Codes: ['A15.9'],
      meshTerms: ['Tuberculosis', 'Mycobacterium tuberculosis']
    }
  },
  {
    id: 'TB-002',
    query: 'TB treatment regimen',
    category: 'infectious',
    specialty: 'infectious disease',
    difficulty: 'medium',
    expectedDiseases: ['tuberculosis'],
    expectedTerms: ['isoniazid', 'rifampin', 'ethambutol', 'pyrazinamide', 'DOTS'],
    expectedSpecialty: 'infectious disease',
    minConfidence: 0.4,
    maxLatencyMs: 15000,
    requiresCitation: true,
    requiresSynonymExpansion: false,
    requiresAcronymExpansion: true,
    metadata: {
      keywords: ['tuberculosis treatment', 'antitubercular', 'DOTS', 'RNTCP']
    }
  },
  {
    id: 'STR-001',
    query: 'What is a stroke?',
    category: 'neurology',
    specialty: 'neurology',
    difficulty: 'easy',
    expectedDiseases: ['stroke'],
    expectedTerms: ['stroke', 'cerebrovascular', 'brain', 'ischemic', 'hemorrhagic'],
    expectedSpecialty: 'neurology',
    minConfidence: 0.5,
    maxLatencyMs: 15000,
    requiresCitation: true,
    requiresSynonymExpansion: false,
    requiresAcronymExpansion: false,
    metadata: {
      icd10Codes: ['I63.9'],
      meshTerms: ['Stroke', 'Brain Ischemia', 'Cerebrovascular Accident']
    }
  },
  {
    id: 'HF-001',
    query: 'What is heart failure?',
    category: 'cardiovascular',
    specialty: 'cardiology',
    difficulty: 'easy',
    expectedDiseases: ['heart failure'],
    expectedTerms: ['heart failure', 'cardiac', 'pump', 'dyspnea', 'edema'],
    expectedSpecialty: 'cardiology',
    minConfidence: 0.5,
    maxLatencyMs: 15000,
    requiresCitation: true,
    requiresSynonymExpansion: false,
    requiresAcronymExpansion: false,
    metadata: {
      icd10Codes: ['I50.9'],
      meshTerms: ['Heart Failure', 'Cardiac Failure']
    }
  },
  {
    id: 'HF-002',
    query: 'Heart failure treatment options',
    category: 'cardiovascular',
    specialty: 'cardiology',
    difficulty: 'medium',
    expectedDiseases: ['heart failure'],
    expectedTerms: ['ACE inhibitor', 'beta-blocker', 'diuretic', 'spironolactone', 'ARNI'],
    expectedSpecialty: 'cardiology',
    minConfidence: 0.4,
    maxLatencyMs: 15000,
    requiresCitation: true,
    requiresSynonymExpansion: false,
    requiresAcronymExpansion: false,
    metadata: {
      keywords: ['heart failure treatment', 'cardiac failure', 'ACE inhibitor', 'beta-blocker']
    }
  },
  {
    id: 'PNE-001',
    query: 'What is pneumonia?',
    category: 'respiratory',
    specialty: 'pulmonology',
    difficulty: 'easy',
    expectedDiseases: ['pneumonia'],
    expectedTerms: ['pneumonia', 'lung', 'infection', 'cough', 'fever', 'antibiotic'],
    expectedSpecialty: 'pulmonology',
    minConfidence: 0.5,
    maxLatencyMs: 15000,
    requiresCitation: true,
    requiresSynonymExpansion: false,
    requiresAcronymExpansion: false,
    metadata: {
      icd10Codes: ['J18.9'],
      meshTerms: ['Pneumonia', 'Lung Diseases', 'Bacterial Infections']
    }
  },
  {
    id: 'PNE-002',
    query: 'Pneumonia antibiotic treatment',
    category: 'respiratory',
    specialty: 'pulmonology',
    difficulty: 'medium',
    expectedDiseases: ['pneumonia'],
    expectedTerms: ['amoxicillin', 'macrolide', 'fluoroquinolone', 'antibiotic', 'bacterial'],
    expectedSpecialty: 'pulmonology',
    minConfidence: 0.4,
    maxLatencyMs: 15000,
    requiresCitation: true,
    requiresSynonymExpansion: false,
    requiresAcronymExpansion: false,
    metadata: {
      keywords: ['pneumonia treatment', 'antibiotics', 'amoxicillin', 'macrolide']
    }
  },
  {
    id: 'HIV-001',
    query: 'What is HIV?',
    category: 'infectious',
    specialty: 'infectious disease',
    difficulty: 'easy',
    expectedDiseases: ['HIV'],
    expectedTerms: ['HIV', 'human immunodeficiency virus', 'AIDS', 'retrovirus'],
    expectedSpecialty: 'infectious disease',
    minConfidence: 0.5,
    maxLatencyMs: 15000,
    requiresCitation: true,
    requiresSynonymExpansion: false,
    requiresAcronymExpansion: true,
    metadata: {
      icd10Codes: ['B20'],
      meshTerms: ['HIV', 'Acquired Immunodeficiency Syndrome']
    }
  },
  {
    id: 'HEP-001',
    query: 'What is hepatitis?',
    category: 'infectious',
    specialty: 'infectious disease',
    difficulty: 'easy',
    expectedDiseases: ['hepatitis'],
    expectedTerms: ['hepatitis', 'liver', 'viral', 'hepatitis B', 'hepatitis C'],
    expectedSpecialty: 'infectious disease',
    minConfidence: 0.5,
    maxLatencyMs: 15000,
    requiresCitation: true,
    requiresSynonymExpansion: false,
    requiresAcronymExpansion: false,
    metadata: {
      icd10Codes: ['B19.9'],
      meshTerms: ['Hepatitis', 'Liver Diseases']
    }
  },
  {
    id: 'HEP-002',
    query: 'Hepatitis C treatment',
    category: 'infectious',
    specialty: 'infectious disease',
    difficulty: 'medium',
    expectedDiseases: ['hepatitis C'],
    expectedTerms: ['sofosbuvir', 'ledipasvir', 'DAA', 'direct-acting antiviral', 'SVR'],
    expectedSpecialty: 'infectious disease',
    minConfidence: 0.4,
    maxLatencyMs: 15000,
    requiresCitation: true,
    requiresSynonymExpansion: false,
    requiresAcronymExpansion: true,
    metadata: {
      keywords: ['hepatitis C treatment', 'direct-acting antiviral', 'sofosbuvir']
    }
  },
];

export const EVALUATION_DATASET_SIZES = {
  small: EVALUATION_QUESTIONS,
  medium: generateMediumDataset(),
  large: generateLargeDataset(),
  xlarge: generateXLargeDataset(),
};

function generateMediumDataset(): EvaluationQuestion[] {
  const baseQuestions = [...EVALUATION_QUESTIONS];
  const additionalQueries = [
    'hypertension guidelines', 'HTN management', 'diabetes management', 'type 2 diabetes treatment',
    'heart attack symptoms', 'MI diagnosis', 'stroke treatment', 'CVA management',
    'asthma controller', 'COPD management', 'malaria prevention', 'TB diagnosis',
    'heart failure medications', 'pneumonia antibiotics', 'HIV testing', 'hepatitis screening',
    'hypertension complications', 'diabetes complications', 'cardiac arrest', 'cerebrovascular disease',
    'respiratory diseases', 'infectious diseases', 'endocrine disorders', 'cardiovascular diseases'
  ];

  additionalQueries.forEach((query, index) => {
    baseQuestions.push({
      id: `GEN-${String(index + 1).padStart(3, '0')}`,
      query,
      category: 'general',
      specialty: 'general',
      difficulty: 'medium',
      expectedDiseases: [],
      expectedTerms: query.toLowerCase().split(' '),
      expectedSpecialty: 'general',
      minConfidence: 0.3,
      maxLatencyMs: 15000,
      requiresCitation: false,
      requiresSynonymExpansion: false,
      requiresAcronymExpansion: false,
      metadata: {}
    });
  });

  return baseQuestions;
}

function generateLargeDataset(): EvaluationQuestion[] {
  const medium = generateMediumDataset();
  const expanded: EvaluationQuestion[] = [...medium];

  const specialtyQueries: Record<string, string[]> = {
    'cardiology': ['chest pain', 'arrhythmia', 'atrial fibrillation', 'heart murmur', 'coronary artery disease', 'heart valve disease', 'pericarditis', 'cardiomyopathy'],
    'neurology': ['seizure', 'migraine', 'Parkinson disease', 'Alzheimer', 'dementia', 'neuropathy', 'multiple sclerosis', 'epilepsy'],
    'pulmonology': ['bronchitis', 'lung cancer', 'pulmonary embolism', 'tuberculosis', 'pleurisy', 'pneumothorax', 'sarcoidosis'],
    'endocrinology': ['hypothyroidism', 'hyperthyroidism', 'Cushing syndrome', 'Addison disease', 'polycystic ovary syndrome', 'osteoporosis'],
    'infectious disease': ['sepsis', 'meningitis', 'encephalitis', 'Lyme disease', 'influenza', 'COVID-19', 'chikungunya', 'dengue'],
    'nephrology': ['chronic kidney disease', 'acute kidney injury', 'glomerulonephritis', 'nephrotic syndrome', 'dialysis'],
    'oncology': ['breast cancer', 'lung cancer', 'colon cancer', 'lymphoma', 'leukemia', 'melanoma', 'prostate cancer'],
    'gastroenterology': ['GERD', 'peptic ulcer', 'Crohn disease', 'ulcerative colitis', 'cirrhosis', 'hepatitis', 'pancreatitis'],
    'rheumatology': ['rheumatoid arthritis', 'osteoarthritis', 'lupus', 'gout', 'psoriatic arthritis', 'ankylosing spondylitis'],
  };

  Object.entries(specialtyQueries).forEach(([specialty, queries]) => {
    queries.forEach((query, index) => {
      expanded.push({
        id: `SPEC-${specialty.substring(0, 3).toUpperCase()}-${String(index + 1).padStart(3, '0')}`,
        query,
        category: specialty,
        specialty,
        difficulty: 'medium',
        expectedDiseases: [],
        expectedTerms: query.toLowerCase().split(' '),
        expectedSpecialty: specialty,
        minConfidence: 0.3,
        maxLatencyMs: 15000,
        requiresCitation: true,
        requiresSynonymExpansion: false,
        requiresAcronymExpansion: false,
        metadata: {}
      });
    });
  });

  return expanded;
}

function generateXLargeDataset(): EvaluationQuestion[] {
  const large = generateLargeDataset();
  const expanded: EvaluationQuestion[] = [...large];

  const symptomQueries = [
    'chest pain', 'shortness of breath', 'abdominal pain', 'headache', 'back pain',
    'cough', 'fever', 'fatigue', 'dizziness', 'syncope',
    'palpitations', 'edema', 'jaundice', 'rash', 'pruritus',
    'nausea', 'vomiting', 'diarrhea', 'constipation', 'weight loss'
  ];

  symptomQueries.forEach((query, index) => {
    expanded.push({
      id: `SX-${String(index + 1).padStart(3, '0')}`,
      query,
      category: 'symptoms',
      specialty: 'general',
      difficulty: 'easy',
      expectedDiseases: [],
      expectedTerms: query.toLowerCase().split(' '),
      expectedSpecialty: 'general',
      minConfidence: 0.3,
      maxLatencyMs: 15000,
      requiresCitation: true,
      requiresSynonymExpansion: false,
      requiresAcronymExpansion: false,
      metadata: {}
    });
  });

  return expanded;
}

export function getEvaluationDataset(size: 'small' | 'medium' | 'large' | 'xlarge' = 'small'): EvaluationQuestion[] {
  return EVALUATION_DATASET_SIZES[size] || EVALUATION_QUESTIONS;
}
