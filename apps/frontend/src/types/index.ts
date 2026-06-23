export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'validator' | 'admin';
  avatar?: string;
  title?: string;
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
  year?: number;
  volume?: string;
  pages?: string;
  type?: 'Guideline' | 'Review' | 'Expert Opinion' | 'Study';
  organization?: string;
  doi?: string;
  url?: string;
  publicationYear?: number;
}

export interface AIResponse {
  id: string;
  queryId: string;
  title: string;
  summary: string;
  keyFindings: string[];
  detailedExplanation: string;
  citations: Citation[];
  status: 'pending' | 'approved' | 'rejected' | 'in_review';
  confidenceScore: number;
  model: string;
  generatedAt: string;
  assignedTo?: string;
  dueDate?: string;
  tags: string[];
  isSaved?: boolean;
  source: 'real' | 'unavailable';
  documentsUsed?: number;
  embeddingModel?: string;
  processingTime?: number;
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
