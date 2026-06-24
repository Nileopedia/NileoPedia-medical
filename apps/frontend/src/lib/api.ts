import { AIResponse, Citation, Query, User } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const SAVED_RESPONSE_IDS_KEY = 'nileopedia.savedResponseIds';

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

type BackendRole = 'MEDICAL_USER' | 'VALIDATOR' | 'ADMIN' | string;
type BackendValidationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | string;

type BackendUser = {
  id: string;
  fullName: string;
  email: string;
  role: BackendRole;
  specialization?: string | null;
  institution?: string | null;
  profileImage?: string | null;
  accountStatus?: string;
};

type BackendCitation = {
  id: string;
  title: string;
  source?: string | null;
  authors?: string | null;
  publicationYear?: number | null;
  doi?: string | null;
  url?: string | null;
  citationIndex?: number | null;
  documentType?: string | null;
  specialty?: string | null;
  pageNumber?: number | null;
  sectionTitle?: string | null;
};

type BackendAiResponse = {
  id: string;
  questionId: string;
  summary: string;
  keyFindings?: string[];
  detailedExplanation?: string;
  confidenceScore?: number | null;
  validationStatus?: BackendValidationStatus;
  generatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
  citations?: BackendCitation[];
};

type BackendQuestion = {
  id: string;
  questionText: string;
  createdAt: string;
  isSaved?: boolean;
  aiResponse?: BackendAiResponse | null;
};

type QuestionDetail = {
  id: string;
  questionText: string;
  createdAt: string;
  isSaved?: boolean;
  aiResponse?: AIResponse;
};

type SearchResult = {
  id: string;
  title: string;
  snippet: string;
  source: string;
  relevanceScore: number;
  specialty?: string;
  citationCount?: number;
  documentType?: string;
};

type SearchResultResponse = {
  query: string;
  results: SearchResult[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  searchType: 'semantic' | 'keyword' | 'hybrid';
};

type BackendValidationReview = {
  id: string;
  aiResponseId: string;
  status: 'APPROVED' | 'REJECTED' | 'PENDING';
  reviewedAt: string;
  score?: number;
  feedback?: string;
  aiResponse: {
    summary: string;
    question: {
      questionText: string;
    };
  };
};

export type ValidationReview = {
  id: string;
  aiResponseId: string;
  aiResponse?: {
    title: string;
    question: {
      questionText: string;
    };
  };
  status: string;
  reviewedAt: string;
  score?: number;
  feedback?: string;
};

type BackendPendingResponse = {
  id: string;
  summary: string;
  createdAt: string;
  question: {
    questionText: string;
  };
};

class ApiClient {
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  private getSavedIds(): string[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(SAVED_RESPONSE_IDS_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
    } catch {
      return [];
    }
  }

  private setSavedIds(ids: string[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(SAVED_RESPONSE_IDS_KEY, JSON.stringify(Array.from(new Set(ids))));
  }

  private addSavedId(questionId: string): void {
    const ids = this.getSavedIds();
    if (!ids.includes(questionId)) {
      this.setSavedIds([...ids, questionId]);
    }
  }

  private removeSavedId(questionId: string): void {
    const ids = this.getSavedIds().filter((id) => id !== questionId);
    this.setSavedIds(ids);
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getAuthToken();
    const headers = new Headers(options.headers);

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    let response: Response;
    try {
      response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });
    } catch (networkError: any) {
      // Handle network errors (server not running, etc.)
      const errorMessage = networkError?.message || 'Network error';
      throw new Error(`Cannot connect to server. Please ensure backend is running. (${errorMessage})`);
    }

    let payload: any;
    try {
      payload = await response.json();
    } catch {
      const text = await response.text().catch(() => '');
      // Check if response is HTML (error page)
      if (text?.includes('<!DOCTYPE html>') || text?.includes('<pre>Error:')) {
        payload = { message: response.status === 401 ? 'Authentication required' : `Server error (${response.status})` };
      } else {
        payload = text ? { message: text } : { message: 'No response body' };
      }
    }

    if (!response.ok) {
       const apiError = payload as { message?: string; errors?: Array<{ msg?: string }> };
       const fallbackMessage = apiError.errors?.[0]?.msg || apiError.message || `Request failed (${response.status})`;
       // Check for authentication errors
       if (response.status === 401) {
         throw new Error('Please sign in to continue');
       }
       // Check for conflict (duplicate email)
       if (response.status === 409) {
         throw new Error('Email already registered');
       }
       // Debug log
       if (process.env.NODE_ENV !== 'test') {
         console.warn(`API Error ${response.status}:`, apiError);
       }
       // Include status code in error for proper handling
       throw new Error(`HTTP_${response.status}:${fallbackMessage}`);
     }

    return payload as T;
  }

  private unwrap<T>(payload: T | ApiEnvelope<T>): T {
    if (payload && typeof payload === 'object' && 'data' in payload && (payload as ApiEnvelope<T>).data !== undefined) {
      return (payload as ApiEnvelope<T>).data as T;
    }

    return payload as T;
  }

  private normalizeRole(role?: BackendRole): User['role'] {
    const normalized = (role || '').toString().toLowerCase();

    if (normalized === 'admin') return 'admin';
    if (normalized === 'validator') return 'validator';
    return 'user';
  }

  private normalizeUser(user: BackendUser): User {
    return {
      id: user.id,
      name: user.fullName,
      email: user.email,
      role: this.normalizeRole(user.role),
      avatar: user.profileImage ?? undefined,
      title: user.institution ?? user.specialization ?? undefined,
    };
  }

  private normalizeCitation(citation: BackendCitation): Citation {
    return {
      id: citation.id,
      title: citation.title,
      authors: citation.authors || citation.source || 'Unknown source',
      journal: citation.source || 'Medical source',
      year: citation.publicationYear || new Date().getFullYear(),
      volume: citation.sectionTitle || undefined,
      pages: citation.pageNumber ? String(citation.pageNumber) : undefined,
      type: 'Study',
      organization: citation.documentType || citation.specialty || undefined,
    };
  }

  private normalizeStatus(status?: BackendValidationStatus): AIResponse['status'] {
    const normalized = (status || '').toString().toLowerCase();

    if (normalized === 'approved') return 'approved';
    if (normalized === 'rejected') return 'rejected';
    return 'pending';
  }

  private normalizeQuestion(question: BackendQuestion): Query {
    return {
      id: question.id,
      question: question.questionText,
      category: 'General',
      status: this.normalizeStatus(question.aiResponse?.validationStatus),
      createdAt: new Date(question.createdAt).toLocaleString(),
      updatedAt: new Date(question.createdAt).toLocaleString(),
      userId: '',
      isSaved: question.isSaved || false,
    };
  }

  private normalizeAiResponse(question: BackendQuestion): QuestionDetail {
    const hasRealResponse = !!(question.aiResponse && 
      question.aiResponse.summary && 
      question.aiResponse.summary !== 'I could not find supporting medical information in the knowledge base.');
    
    const aiResponse = question.aiResponse
      ? {
          id: question.aiResponse.id,
          queryId: question.id,
          title: question.questionText,
          summary: question.aiResponse.summary,
          keyFindings: question.aiResponse.keyFindings || [],
          detailedExplanation: question.aiResponse.detailedExplanation || question.aiResponse.summary,
          citations: (question.aiResponse.citations || []).map((citation) => this.normalizeCitation(citation)),
          status: this.normalizeStatus(question.aiResponse.validationStatus),
          confidenceScore: question.aiResponse.confidenceScore || 0,
          model: question.aiResponse.generatedBy || 'Llama-3.3-70b',
          generatedAt: question.aiResponse.createdAt || question.createdAt,
          tags: [],
          isSaved: question.isSaved || false,
          source: (hasRealResponse ? 'real' : 'unavailable') as 'real' | 'unavailable',
        }
      : {
          id: `resp-${question.id}`,
          queryId: question.id,
          title: question.questionText,
          summary: 'I could not find supporting medical information in the knowledge base.',
          keyFindings: [],
          detailedExplanation: '',
          citations: [],
          status: 'pending' as const,
          confidenceScore: 0,
          model: 'Unavailable',
          generatedAt: new Date().toISOString(),
          tags: [],
          isSaved: false,
          source: 'unavailable' as const,
        };

    return {
      id: question.id,
      questionText: question.questionText,
      createdAt: question.createdAt,
      isSaved: question.isSaved || false,
      aiResponse,
    };
  }

  async askQuestion(question: string, specialty?: string, responseStyle?: string): Promise<{ questionId: string; status: string; message: string }> {
    const payload = await this.request<ApiEnvelope<{ questionId: string; status: string; message: string }>>('/questions/ask', {
      method: 'POST',
      body: JSON.stringify({ question, specialty, responseStyle }),
    });

    return this.unwrap(payload);
  }

  async getQuestion(questionId: string): Promise<QuestionDetail> {
    const payload = await this.request<ApiEnvelope<BackendQuestion>>(`/questions/${questionId}`);
    return this.normalizeAiResponse(this.unwrap(payload));
  }

  async getHistory(): Promise<Query[]> {
    const payload = await this.request<ApiEnvelope<BackendQuestion[]>>('/questions/history');
    const questions = this.unwrap(payload);
    return questions.map((question) => {
      const mapped = this.normalizeQuestion(question);
      return {
        ...mapped,
        userId: question.id,
      };
    });
  }

  async login(email: string, password: string): Promise<{ token: string; refreshToken?: string; user: User }> {
    const payload = await this.request<ApiEnvelope<{ accessToken: string; refreshToken: string; user: BackendUser }>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    const data = this.unwrap(payload);
    return {
      token: data.accessToken,
      refreshToken: data.refreshToken,
      user: this.normalizeUser(data.user),
    };
  }

  async register(
    fullName: string,
    email: string,
    password: string,
    role: 'MEDICAL_USER' | 'VALIDATOR',
    institution?: string,
    specialization?: string,
  ): Promise<{ token: string; refreshToken?: string; user: User }> {
    const payload = await this.request<ApiEnvelope<{ accessToken: string; refreshToken: string; user: BackendUser }>>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ fullName, email, password, role, institution, specialization }),
    });

    const data = this.unwrap(payload);
    return {
      token: data.accessToken,
      refreshToken: data.refreshToken,
      user: this.normalizeUser(data.user),
    };
  }

  async verifyEmail(email: string): Promise<{ requiresOtp: boolean }> {
    return this.request('/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async verifyOtp(email: string, otp: string): Promise<{ token: string; refreshToken?: string; user: User }> {
    const payload = await this.request<ApiEnvelope<{ accessToken: string; refreshToken: string; user: BackendUser }>>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });

    const data = this.unwrap(payload);
    return {
      token: data.accessToken,
      refreshToken: data.refreshToken,
      user: this.normalizeUser(data.user),
    };
  }

  async forgotPassword(email: string): Promise<void> {
    await this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(email: string, token: string, newPassword: string): Promise<void> {
    await this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, token, newPassword }),
    });
  }

  async saveResponse(questionId: string): Promise<void> {
    await this.request(`/questions/${questionId}/save`, {
      method: 'POST',
    });
  }

  async unsaveResponse(questionId: string): Promise<void> {
    await this.request(`/questions/${questionId}/save`, {
      method: 'DELETE',
    });
  }

  async getSavedResponses(): Promise<Query[]> {
    const history = await this.getHistory();
    return history.filter((query) => query.isSaved);
  }

  async search(
    query: string,
    type: 'semantic' | 'keyword' | 'hybrid' = 'hybrid',
    limit: number = 10,
    page: number = 1
  ): Promise<SearchResultResponse> {
    const params = new URLSearchParams({ q: query, type, limit: String(limit), page: String(page) });
    const payload = await this.request<ApiEnvelope<SearchResultResponse>>(`/search?${params.toString()}`);
    const data = this.unwrap(payload);
    
    // Handle error response (Pinecone unavailable)
    if ('success' in data && data.success === false) {
      const errorData = data as { success: false; error?: string };
      throw new Error(errorData.error || 'Real search unavailable');
    }
    
    return data;
  }

  async uploadDocument(file: File): Promise<{ documentId: string; status: string }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const token = this.getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}/documents/upload`, {
      method: 'POST',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: formData,
    });

    // Handle non-JSON responses (HTML error pages)
    let payload: any;
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        payload = await response.json();
      } else {
        payload = { message: `Server error (${response.status})` };
      }
    } catch {
      payload = { message: `Request failed (${response.status})` };
    }

    if (!response.ok) {
      const errorMessage = payload?.message || `Upload failed (${response.status})`;
      throw new Error(errorMessage);
    }

    return this.unwrap(payload);
  }

  async getNotifications(): Promise<Array<{ id: string; title: string; message: string; read: boolean; createdAt: string }>> {
    const payload = await this.request<ApiEnvelope<Array<{ id: string; title: string; message: string; read: boolean; createdAt: string }>>>('/notifications');
    return this.unwrap(payload);
  }

  async getPendingReviews(): Promise<Array<{ id: string; title: string; category: string; submittedAt: string; dueDate: string; priority: string; status: string }>> {
    const payload = await this.request<ApiEnvelope<BackendPendingResponse[]>>('/validation/pending');
    const items = this.unwrap(payload);
    return items.map((item) => ({
      id: item.id,
      title: item.question?.questionText || item.summary.substring(0, 50),
      category: 'General',
      submittedAt: item.createdAt,
      dueDate: '',
      priority: 'medium',
      status: 'pending',
    }));
  }

  async getValidationHistory(): Promise<ValidationReview[]> {
    const payload = await this.request<ApiEnvelope<BackendValidationReview[]>>('/validation/history');
    const items = this.unwrap(payload);
    return items.map((item) => ({
      id: item.id,
      aiResponseId: item.aiResponseId,
      aiResponse: {
        title: item.aiResponse?.summary?.substring(0, 50) || 'Untitled',
        question: {
          questionText: item.aiResponse?.question?.questionText || 'Unknown query',
        },
      },
      status: this.normalizeStatus(item.status),
      reviewedAt: item.reviewedAt,
      score: item.score,
      feedback: item.feedback,
    }));
  }

  async approveReview(responseId: string, score: number, feedback: string): Promise<void> {
    await this.request(`/validation/${responseId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ score, feedback }),
    });
  }

  async rejectReview(responseId: string, feedback: string): Promise<void> {
    await this.request(`/validation/${responseId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ feedback }),
    });
  }

  async runScheduledIngestion(): Promise<void> {
    await this.request('/admin/ingestion/run', {
      method: 'POST',
    });
  }

  async getIngestionStatus(): Promise<{ isRunning: boolean; isActive: boolean; sources: number }> {
    const payload = await this.request<{ success: boolean; data: { isRunning: boolean; isActive: boolean; sources: number } }>(
      '/admin/ingestion/status'
    );
    return payload.data;
  }

  async runIncrementalRefresh(): Promise<void> {
    await this.request('/admin/ingestion/refresh', {
      method: 'POST',
    });
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await this.request('/users/change-password', {
      method: 'PATCH',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  async getSystemStatus(): Promise<{ embeddings: boolean; pinecone: boolean; groq: boolean; redis: boolean; totalDocuments: number; totalVectors: number }> {
    return this.request('/admin/system-status', {
      method: 'GET',
    });
  }

  async createValidator(data: {
    fullName: string;
    email: string;
    password?: string;
    specialization?: string;
    institution?: string;
  }): Promise<{ id: string; fullName: string; email: string; role: string }> {
    const payload = await this.request<{ success: boolean; data: { id: string; fullName: string; email: string; role: string } }>('/users/validator', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return payload.data;
  }
}

export const api = new ApiClient();