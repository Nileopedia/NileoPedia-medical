import { Query, AIResponse } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

class ApiClient {
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getAuthToken();
    const headers = new Headers(options.headers);
    
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }

  async askQuestion(question: string): Promise<{ questionId: string; status: string; message: string }> {
    return this.request('/questions/ask', {
      method: 'POST',
      body: JSON.stringify({ question }),
    });
  }

  async getQuestion(questionId: string): Promise<{ id: string; questionText: string; aiResponse?: AIResponse }> {
    return this.request(`/questions/${questionId}`);
  }

  async getHistory(): Promise<Query[]> {
    return this.request('/questions/history');
  }

  async login(email: string, password: string): Promise<{ token: string; user: { id: string; name: string; email: string; role: string } }> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(name: string, email: string, password: string, role: string): Promise<{ token: string; user: any }> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    });
  }

  async verifyEmail(email: string): Promise<{ requiresOtp: boolean }> {
    return this.request('/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async verifyOtp(email: string, otp: string): Promise<{ token: string; user: any }> {
    return this.request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  }

  async saveResponse(questionId: string): Promise<void> {
    return this.request(`/questions/${questionId}/save`, {
      method: 'POST',
    });
  }

  async unsaveResponse(questionId: string): Promise<void> {
    return this.request(`/questions/${questionId}/save`, {
      method: 'DELETE',
    });
  }

  async getSavedResponses(): Promise<Query[]> {
    return this.request('/questions/saved');
  }
}

export const api = new ApiClient();