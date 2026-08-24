import { AIResponse, Citation, Query, User } from '../types';
import { useAppStore } from '../store/appStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
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
  detailedExplanation?: string;
  keyFindings?: string[];
  confidenceScore?: number | null;
  validationStatus?: BackendValidationStatus;
  generatedBy?: string;
  processingTime?: number | null;
  documentsUsed?: number | null;
  createdAt?: string;
  updatedAt?: string;
  citations?: BackendCitation[];
};

type BackendQuestion = {
  id: string;
  questionText: string;
  category?: string;
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

type MedicalTopicsResponse = {
  success: boolean;
  topics: Array<{ name: string; category: string; documentCount: number }>;
  specialties: string[];
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
  private refreshPromise: Promise<boolean> | null = null;

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refreshToken');
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (this.refreshPromise) return this.refreshPromise;

    this.refreshPromise = (async () => {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) return false;

      try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) return false;

        const payload = await response.json();
        const data = payload?.data;
        if (!data?.accessToken) return false;

        localStorage.setItem('token', data.accessToken);
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        }
        return true;
      } catch {
        return false;
      }
    })();

    try {
      return await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }

  private handleSessionExpired(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    useAppStore.getState().setUser(null);
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
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
    return this.performRequest<T>(endpoint, options, true);
  }

  private async performRequest<T>(endpoint: string, options: RequestInit = {}, allowRefresh: boolean): Promise<T> {
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

    if (response.status === 401 && allowRefresh && token && !endpoint.includes('/auth/refresh-token')) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        return this.performRequest<T>(endpoint, options, false);
      }
      this.handleSessionExpired();
    }

    if (!response.ok) {
       const apiError = payload as { message?: string; errors?: Array<{ msg?: string }> };
        const fallbackMessage = apiError.errors?.[0]?.msg || apiError.message || `Request failed (${response.status})`;
        // Check for authentication errors
        if (response.status === 401) {
          if (!allowRefresh && token) {
            this.handleSessionExpired();
          }
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
      journal: citation.source || citation.documentType || 'Medical source',
      year: citation.publicationYear || new Date().getFullYear(),
      volume: citation.sectionTitle || undefined,
      pages: citation.pageNumber ? String(citation.pageNumber) : undefined,
      type: 'Study',
      organization: citation.specialty || undefined,
      doi: citation.doi || undefined,
      url: citation.url || undefined,
    };
  }

  private parseSections(raw?: string): Record<string, string> {
    if (!raw) return {};
    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'object' && parsed !== null && !parsed.clinicalSummary) {
        return parsed;
      }
    } catch {
      // Not JSON, return as general explanation
    }
    return { general: raw };
  }

  private parseStructuredResponse(raw?: string): import('../types').StructuredMedicalResponse | undefined {
    if (!raw) return undefined;
    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'object' && parsed !== null && parsed.clinicalSummary) {
        return parsed as import('../types').StructuredMedicalResponse;
      }
    } catch {
      // Not structured response
    }
    return undefined;
  }

  private extractRecommendations(findings: string[]): string[] {
    return (findings || [])
      .map(f => f.replace(/^[•\-✓✔]\s*/, '').trim())
      .filter(Boolean);
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
      category: question.category || 'General',
      status: this.normalizeStatus(question.aiResponse?.validationStatus),
      createdAt: new Date(question.createdAt).toLocaleString(),
      updatedAt: new Date(question.createdAt).toLocaleString(),
      userId: '',
      isSaved: question.isSaved || false,
    };
  }

  private normalizeAiResponse(question: BackendQuestion): QuestionDetail {
    if (!question.aiResponse) {
      return {
        id: question.id,
        questionText: question.questionText,
        createdAt: question.createdAt,
        isSaved: question.isSaved || false,
      };
    }

    const NO_RESULTS = 'I could not find supporting medical information in the knowledge base.';
    const OUT_OF_SCOPE_SUMMARY = 'Question outside supported medical domain.';
    const isOutOfScope = question.aiResponse.generatedBy === 'Domain Filter' ||
      question.aiResponse.responseType === 'OUT_OF_SCOPE' ||
      question.aiResponse.summary === OUT_OF_SCOPE_SUMMARY;

    const aiResponse: AIResponse = {
      id: question.aiResponse.id,
      queryId: question.id,
      title: question.questionText,
      summary: question.aiResponse.summary,
      structuredResponse: isOutOfScope ? undefined : this.parseStructuredResponse(question.aiResponse.detailedExplanation),
      keyRecommendations: isOutOfScope ? [] : this.extractRecommendations(question.aiResponse.keyFindings ?? []),
      sections: isOutOfScope ? {} : this.parseSections(question.aiResponse.detailedExplanation),
      citations: isOutOfScope ? [] : (question.aiResponse.citations || []).map((citation) => this.normalizeCitation(citation)),
      status: this.normalizeStatus(question.aiResponse.validationStatus),
      confidenceScore: isOutOfScope ? 0 : (question.aiResponse.confidenceScore || 0),
      model: isOutOfScope ? 'Domain Filter' : (question.aiResponse.generatedBy || 'Llama-3.3-70b'),
      generatedAt: question.aiResponse.createdAt || question.createdAt,
      tags: [],
      isSaved: question.isSaved || false,
      source: (
        question.aiResponse.generatedBy === 'Pipeline Error'
          ? 'unavailable'
          : isOutOfScope
            ? 'out_of_scope'
            : question.aiResponse.summary === NO_RESULTS
              ? 'no_results'
              : 'real'
      ) as 'real' | 'unavailable' | 'no_results' | 'out_of_scope',
      documentsUsed: isOutOfScope ? 0 : (question.aiResponse.documentsUsed ?? 0),
      processingTime: question.aiResponse.processingTime ?? undefined,
      responseType: (question.aiResponse.responseType as AIResponse['responseType']) || (isOutOfScope ? 'OUT_OF_SCOPE' : 'NORMAL'),
      message: isOutOfScope
        ? 'NileoPedia only answers evidence-based medical and healthcare questions.'
        : undefined,
      recommendation: isOutOfScope
        ? 'Please ask a medical, pharmaceutical, nursing, laboratory, anatomy, physiology, pathology, diagnosis, treatment or healthcare related question.'
        : undefined,
      examples: isOutOfScope
        ? [
            'What is hypertension?',
            'Symptoms of malaria',
            'What causes diabetes?',
            'Treatment of asthma',
            'Side effects of metformin',
          ]
        : undefined,
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
    const normalized = this.normalizeAiResponse(this.unwrap(payload));
    
    console.log('================================');
    console.log('Frontend API Payload');
    console.log('================================');
    console.log('Raw backend response:', JSON.stringify(this.unwrap(payload), null, 2));
    console.log('Normalized response:', JSON.stringify(normalized, null, 2));
    console.log('Response source:', normalized.aiResponse?.source);
    console.log('Response summary:', normalized.aiResponse?.summary);
    console.log('Has structured response:', !!normalized.aiResponse?.structuredResponse);
    console.log('================================\n');
    
    return normalized;
  }

  async getHistory(options: { page?: number; limit?: number; category?: string; startDate?: string; endDate?: string } = {}): Promise<{ questions: Query[]; total: number; page: number; limit: number; totalPages: number }> {
    const { page = 1, limit = 10, category, startDate, endDate } = options;
    const query = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (category) query.set('category', category);
    if (startDate) query.set('startDate', startDate);
    if (endDate) query.set('endDate', endDate);
    const payload = await this.request<ApiEnvelope<{ questions: BackendQuestion[]; meta: { total: number; page: number; limit: number; totalPages: number } }>>(`/questions/history?${query.toString()}`);
    const data = this.unwrap(payload);
    return {
      questions: data.questions.map((question) => {
        const mapped = this.normalizeQuestion(question);
        return { ...mapped, userId: question.id };
      }),
      total: data.meta.total,
      page: data.meta.page,
      limit: data.meta.limit,
      totalPages: data.meta.totalPages,
    };
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

  async getSavedResponses(options: { page?: number; limit?: number; search?: string } = {}): Promise<{ questions: Query[]; total: number; page: number; limit: number; totalPages: number }> {
    const { page = 1, limit = 10, search } = options;
    const query = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) query.set('search', search);
    const payload = await this.request<ApiEnvelope<{ questions: BackendQuestion[]; meta: { total: number; page: number; limit: number; totalPages: number } }>>(`/questions/saved?${query.toString()}`);
    const data = this.unwrap(payload);
    return {
      questions: data.questions.map((question) => {
        const mapped = this.normalizeQuestion(question);
        return { ...mapped, userId: question.id, isSaved: true };
      }),
      total: data.meta.total,
      page: data.meta.page,
      limit: data.meta.limit,
      totalPages: data.meta.totalPages,
    };
  }

  async getDashboardAnalytics() {
    const payload = await this.request<ApiEnvelope<{
      totalQueries: number;
      savedResponses: number;
      aiResponsesGenerated: number;
      pendingResponses: number;
      approvedResponses: number;
      avgResponseTime: string;
      topCategories: Array<{ name: string; count: number }>;
      dailyTrends: Record<string, number>;
      activities: Array<{ id: string; type: string; title: string; description: string; status: string; timestamp: string }>;
      recentQueries: Array<{ id: string; question: string; category: string; status: string; createdAt: string; updatedAt: string; isSaved: boolean; confidenceScore: number | null; responseTime: number | null }>;
    }>>('/analytics/user/dashboard');
    return this.unwrap(payload);
  }

  async getCurrentUser() {
    const payload = await this.request<ApiEnvelope<{
      id: string;
      fullName: string;
      email: string;
      role: string;
      specialization?: string | null;
      institution?: string | null;
      profileImage?: string | null;
      bio?: string | null;
      isEmailVerified: boolean;
      accountStatus: string;
      createdAt: string;
    }>>('/users/me');
    const data = this.unwrap(payload);
    return {
      id: data.id,
      name: data.fullName,
      email: data.email,
      role: this.normalizeRole(data.role),
      avatar: data.profileImage ?? undefined,
      title: data.institution ?? data.specialization ?? undefined,
      specialty: data.specialization ?? undefined,
      bio: data.bio ?? undefined,
      createdAt: data.createdAt,
    };
  }

  async updateProfile(data: { fullName?: string; email?: string; specialization?: string; institution?: string; profileImage?: string; bio?: string }) {
    const payload = await this.request<ApiEnvelope<{
      id: string;
      fullName: string;
      email: string;
      role: string;
      specialization?: string | null;
      institution?: string | null;
      profileImage?: string | null;
      bio?: string | null;
      isEmailVerified: boolean;
      accountStatus: string;
    }>>('/users/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    const user = this.unwrap(payload);
    return {
      id: user.id,
      name: user.fullName,
      email: user.email,
      role: this.normalizeRole(user.role),
      avatar: user.profileImage ?? undefined,
      title: user.institution ?? user.specialization ?? undefined,
      specialty: user.specialization ?? undefined,
      bio: user.bio ?? undefined,
    };
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

  async getMedicalTopics(query?: string, specialty?: string): Promise<{ topics: Array<{ name: string; category: string; documentCount: number }>; specialties: string[] }> {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (specialty && specialty !== 'All') params.set('specialty', specialty);
    const payload = await this.request<ApiEnvelope<MedicalTopicsResponse>>(`/medical-topics${params.toString() ? `?${params.toString()}` : ''}`);
    const data = this.unwrap(payload);
    return { topics: data.topics || [], specialties: data.specialties || [] };
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

  async deleteAllDocuments(): Promise<void> {
    await this.request('/documents/all', { method: 'DELETE' });
  }

  async updateDocument(id: string, data: {
    title?: string;
    description?: string;
    specialty?: string;
    documentType?: string;
    source?: string;
    publicationYear?: number;
  }): Promise<any> {
    const payload = await this.request<{ success: boolean; data: any }>(`/documents/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return this.unwrap(payload.data);
  }

  async getNotifications(): Promise<Array<{ id: string; title: string; message: string; read: boolean; createdAt: string }>> {
    const payload = await this.request<ApiEnvelope<Array<{ id: string; title: string; message: string; read: boolean; createdAt: string }>>>('/notifications');
    return this.unwrap(payload);
  }

  async getPendingReviews(): Promise<Array<{ id: string; aiResponseId: string; title: string; category: string; submittedAt: string; dueDate: string; priority: string; status: string }>> {
    const payload = await this.request<ApiEnvelope<BackendPendingResponse[]>>('/validation/pending');
    const items = this.unwrap(payload);
    return items.map((item) => ({
      id: item.id,
      aiResponseId: item.id,
      title: item.question?.questionText || item.summary.substring(0, 50),
      category: 'General',
      submittedAt: item.createdAt,
      dueDate: '',
      priority: 'medium',
      status: 'pending',
    }));
  }

  async getValidationHistory(page?: number, limit?: number, search?: string, startDate?: string): Promise<{ reviews: ValidationReview[]; pagination: { total: number; page: number; limit: number; totalPages: number } }> {
    const params = new URLSearchParams();
    if (page) params.set('page', String(page));
    if (limit) params.set('limit', String(limit));
    if (search) params.set('search', search);
    if (startDate) params.set('startDate', startDate);
    const qs = params.toString();
    const payload = await this.request<ApiEnvelope<BackendValidationReview[] & { pagination?: { total: number; page: number; limit: number; totalPages: number } }>>(`/validation/history?${qs}`);
    const data = this.unwrap(payload);
    const reviews = Array.isArray(data) ? data : (data as any).reviews || [];
    const pagination = Array.isArray(data) 
      ? { total: reviews.length, page: 1, limit: reviews.length, totalPages: 1 } 
      : (data as any).pagination || { total: 0, page: 1, limit: limit || 20, totalPages: 0 };
    return {
      reviews: reviews.map((item: any) => ({
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
      })),
      pagination,
    };
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

  async checkHealth(): Promise<{ status: string; database: string; socket: string }> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const rootUrl = baseUrl.replace(/\/api\/v1$/, '');
    const response = await fetch(`${rootUrl}/api/health`);
    if (!response.ok) {
      throw new Error('Health check failed');
    }
    return response.json();
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

  async getAuditLogs(params: { page?: number; limit?: number; action?: string; entityType?: string; userId?: string; startDate?: string; endDate?: string } = {}): Promise<{ logs: Array<{ id: string; action: string; entityType?: string; entityId?: string; description?: string; ipAddress?: string; userAgent?: string; createdAt: string; user?: { id: string; fullName: string; email: string; role: string } }>; total: number; page: number; limit: number; totalPages: number }> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.action) query.set('action', params.action);
    if (params.entityType) query.set('entityType', params.entityType);
    if (params.userId) query.set('userId', params.userId);
    if (params.startDate) query.set('startDate', params.startDate);
    if (params.endDate) query.set('endDate', params.endDate);
    const qs = query.toString();
    const payload = await this.request<{ success: boolean; data: { logs: Array<{ id: string; action: string; entityType?: string; entityId?: string; description?: string; ipAddress?: string; userAgent?: string; createdAt: string; user?: { id: string; fullName: string; email: string; role: string } }>; pagination: { total: number; page: number; limit: number; totalPages: number } } }>(`/audit-logs${qs ? `?${qs}` : ''}`);
    const d = payload.data;
    return { logs: d.logs, total: d.pagination.total, page: d.pagination.page, limit: d.pagination.limit, totalPages: d.pagination.totalPages };
  }

  async getSecurityEvents(params: { page?: number; limit?: number } = {}): Promise<{ logs: Array<{ id: string; action: string; entityType?: string; entityId?: string; description?: string; ipAddress?: string; userAgent?: string; createdAt: string; user?: { id: string; fullName: string; email: string; role: string } }>; total: number; page: number; limit: number; totalPages: number }> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    const qs = query.toString();
    const payload = await this.request<{ success: boolean; data: { logs: Array<{ id: string; action: string; entityType?: string; entityId?: string; description?: string; ipAddress?: string; userAgent?: string; createdAt: string; user?: { id: string; fullName: string; email: string; role: string } }>; pagination: { total: number; page: number; limit: number; totalPages: number } } }>(`/audit-logs/security${qs ? `?${qs}` : ''}`);
    const d = payload.data;
    return { logs: d.logs, total: d.pagination.total, page: d.pagination.page, limit: d.pagination.limit, totalPages: d.pagination.totalPages };
  }

  async getUserActivityLogs(userId: string, params: { page?: number; limit?: number } = {}): Promise<{ logs: Array<{ id: string; action: string; entityType?: string; entityId?: string; description?: string; ipAddress?: string; userAgent?: string; createdAt: string; user?: { id: string; fullName: string; email: string; role: string } }>; total: number; page: number; limit: number; totalPages: number }> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    const qs = query.toString();
    const payload = await this.request<{ success: boolean; data: { logs: Array<{ id: string; action: string; entityType?: string; entityId?: string; description?: string; ipAddress?: string; userAgent?: string; createdAt: string; user?: { id: string; fullName: string; email: string; role: string } }>; pagination: { total: number; page: number; limit: number; totalPages: number } } }>(`/audit-logs/user/${userId}${qs ? `?${qs}` : ''}`);
    const d = payload.data;
    return { logs: d.logs, total: d.pagination.total, page: d.pagination.page, limit: d.pagination.limit, totalPages: d.pagination.totalPages };
  }

  async getValidationActivity(params: { page?: number; limit?: number } = {}): Promise<{ logs: Array<{ id: string; action: string; entityType?: string; entityId?: string; description?: string; ipAddress?: string; userAgent?: string; createdAt: string; user?: { id: string; fullName: string; email: string; role: string } }>; total: number; page: number; limit: number; totalPages: number }> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    const qs = query.toString();
    const payload = await this.request<{ success: boolean; data: { logs: Array<{ id: string; action: string; entityType?: string; entityId?: string; description?: string; ipAddress?: string; userAgent?: string; createdAt: string; user?: { id: string; fullName: string; email: string; role: string } }>; pagination: { total: number; page: number; limit: number; totalPages: number } } }>(`/audit-logs/validation${qs ? `?${qs}` : ''}`);
    const d = payload.data;
    return { logs: d.logs, total: d.pagination.total, page: d.pagination.page, limit: d.pagination.limit, totalPages: d.pagination.totalPages };
  }
}

export const api = new ApiClient();