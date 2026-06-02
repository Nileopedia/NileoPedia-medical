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
  aiResponse?: BackendAiResponse | null;
};

type QuestionDetail = {
  id: string;
  questionText: string;
  createdAt: string;
  aiResponse?: AIResponse;
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

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getAuthToken();
    const headers = new Headers(options.headers);

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const payload = await response.json().catch(async () => {
      const text = await response.text().catch(() => '');
      return text ? { message: text } : {};
    });

    if (!response.ok) {
      const apiError = payload as { message?: string; errors?: Array<{ msg?: string }> };
      const fallbackMessage = apiError.errors?.[0]?.msg || apiError.message || 'Request failed';
      throw new Error(fallbackMessage);
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
    };
  }

  private normalizeAiResponse(question: BackendQuestion): QuestionDetail {
    const aiResponse = question.aiResponse
      ? {
          id: question.aiResponse.id,
          queryId: question.id,
          title: question.questionText,
          summary: question.aiResponse.summary,
          keyFindings: question.aiResponse.summary
            .split('.')
            .map((finding) => finding.trim())
            .filter(Boolean)
            .slice(0, 5),
          detailedExplanation: question.aiResponse.summary,
          citations: (question.aiResponse.citations || []).map((citation) => this.normalizeCitation(citation)),
          status: this.normalizeStatus(question.aiResponse.validationStatus),
          confidenceScore: question.aiResponse.confidenceScore || 0,
          model: question.aiResponse.generatedBy || 'GPT-4o',
          generatedAt: question.aiResponse.createdAt || question.createdAt,
          tags: [],
        }
      : undefined;

    return {
      id: question.id,
      questionText: question.questionText,
      createdAt: question.createdAt,
      aiResponse,
    };
  }

  async askQuestion(question: string): Promise<{ questionId: string; status: string; message: string }> {
    const payload = await this.request<ApiEnvelope<{ questionId: string; status: string; message: string }>>('/questions/ask', {
      method: 'POST',
      body: JSON.stringify({ question }),
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
    role: 'MEDICAL_USER' | 'VALIDATOR' | 'ADMIN',
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

  async verifyOtp(email: string, otp: string): Promise<{ token: string; user: User }> {
    return this.request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  }

  async saveResponse(questionId: string): Promise<void> {
    await this.request(`/questions/${questionId}/save`, {
      method: 'POST',
    });
    this.addSavedId(questionId);
  }

  async unsaveResponse(questionId: string): Promise<void> {
    await this.request(`/questions/${questionId}/save`, {
      method: 'DELETE',
    });
    this.removeSavedId(questionId);
  }

  async getSavedResponses(): Promise<Query[]> {
    const history = await this.getHistory();
    const savedIds = this.getSavedIds();

    if (savedIds.length === 0) {
      return [];
    }

    return history.filter((query) => savedIds.includes(query.id));
  }

  async uploadDocument(file: File): Promise<{ documentId: string; status: string }> {
    const formData = new FormData();
    formData.append('document', file);
    
    const response = await fetch(`${API_BASE_URL}/documents`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.getAuthToken()}`,
      },
      body: formData,
    });

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.message || 'Upload failed');
    }

    return this.unwrap(payload);
  }

  async getNotifications(): Promise<Array<{ id: string; title: string; message: string; read: boolean; createdAt: string }>> {
    const payload = await this.request<ApiEnvelope<Array<{ id: string; title: string; message: string; read: boolean; createdAt: string }>>>('/notifications');
    return this.unwrap(payload);
  }
}

export const api = new ApiClient();
