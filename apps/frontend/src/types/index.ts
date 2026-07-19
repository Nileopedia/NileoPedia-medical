export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'validator' | 'admin';
  avatar?: string;
  title?: string;
  specialty?: string;
  bio?: string;
  createdAt?: string;
}

export interface Query {
  id: string;
  question: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected' | 'in_review';
  createdAt: string;
  updatedAt: string;
  userId: string;
  assignedTo?: string;
  dueDate?: string;
  isSaved?: boolean;
}

export interface Citation {
  id?: string;
  title: string;
  source?: string;
  authors?: string;
  journal?: string;
  publisher?: string;
  organization?: string;
  year?: number;
  volume?: string;
  pages?: string;
  pageNumber?: number;
  issue?: string;
  type?: 'Guideline' | 'Review' | 'Expert Opinion' | 'Study';
  doi?: string;
  url?: string;
  publicationYear?: number;
  documentType?: string;
  medicalSpecialty?: string;
  pmid?: string;
  pmcid?: string;
  preview?: string;
}

export interface StructuredMedicalResponse {
  clinicalSummary: string;
  definition: string;
  clinicalOverview: string;
  causes: string[];
  riskFactors: string[];
  symptoms: string[];
  diagnosis: string[];
  treatment: {
    lifestyle: string[];
    medications: Array<{
      name: string;
      class: string;
      use: string;
    }>;
  };
  lifestyleManagement: string[];
  complications: string[];
  prevention: string[];
  specialPopulations: string[];
  prognosis: string;
  patientEducation: string[];
  keyTakeaways: string[];
  warningBoxes: Array<{
    type: 'emergency' | 'drug_interaction' | 'contraindication' | 'general';
    title: string;
    content: string;
  }>;
  tables: Array<{
    title: string;
    headers: string[];
    rows: string[][];
  }>;
  references: Array<{
    title: string;
    authors: string;
    journal?: string;
    organization?: string;
    year: number;
    doi?: string;
    url?: string;
    publisher?: string;
    documentType?: string;
    medicalSpecialty?: string;
    volume?: string;
    issue?: string;
    pages?: string;
    isbn?: string;
    pmid?: string;
    pmcid?: string;
  }>;
  followUpQuestions: string[];
  patientFriendlyVersion: string;
}

export interface AIResponse {
  id: string;
  queryId: string;
  title: string;
  summary: string;
  structuredResponse?: StructuredMedicalResponse;
  keyRecommendations: string[];
  sections: Record<string, string>;
  citations: Citation[];
  status: 'pending' | 'approved' | 'rejected' | 'in_review';
  confidenceScore: number;
  model: string;
  generatedAt: string;
  assignedTo?: string;
  dueDate?: string;
  tags: string[];
  isSaved?: boolean;
  source: 'real' | 'unavailable' | 'no_results';
  documentsUsed?: number;
  embeddingModel?: string;
  processingTime?: number;
  specialty?: string;
  evidenceLevel?: string;
}

export interface Activity {
  id: string;
  type: 'query_submitted' | 'response_validated' | 'query_rejected' | 'user_registered';
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'info';
  timestamp: string;
}

export interface CategoryStat {
  name: string;
  value: number;
  color: string;
}

export interface ValidationReview {
  id: string;
  aiResponseId: string;
  aiResponse: {
    title: string;
    question: {
      questionText: string;
    };
  };
  status: 'pending' | 'approved' | 'rejected' | 'in_review';
  reviewedAt: string;
  score?: number;
  feedback?: string;
}

export interface ValidationStat {
  approved: number;
  pending: number;
  rejected: number;
  total: number;
  approvalRate: number;
}
