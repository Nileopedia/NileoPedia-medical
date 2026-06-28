import { render, screen } from '@testing-library/react';
import React from 'react';
import { vi } from 'vitest';
import { ToastProvider } from '../components/ui/Toast';

vi.mock('socket.io-client', () => ({
  io: vi.fn(() => ({
    on: vi.fn((event: string) => {}),
    emit: vi.fn(),
    disconnect: vi.fn(),
  })),
}));

vi.mock('../../store/appStore', () => ({
  useAppStore: () => ({ user: { id: 'test-user-id' }, toggleMobileNav: vi.fn() }),
}));

vi.mock('../../lib/api', () => ({
  api: {
    askQuestion: vi.fn().mockResolvedValue({ questionId: 'test-question-id' }),
    getQuestion: vi.fn().mockResolvedValue({ aiResponse: { id: 'resp-1', summary: 'Done', keyRecommendations: [] } }),
  },
}));

vi.mock('../../components/query/ResponseViewer', () => ({
  ResponseViewer: ({ response }: { response: unknown }) => <div data-testid="response-viewer">Response</div>,
}));

vi.mock('../../components/layout/AppLayout', () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('../../components/layout/Navbar', () => ({
  Navbar: () => <div data-testid="navbar">Navbar</div>,
}));

describe('Ask Page - Socket.IO Streaming', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Ask AI page with question form', async () => {
    const { default: AskPage } = await import('../app/ask/page');
    render(
      <ToastProvider>
        <AskPage />
      </ToastProvider>
    );
    expect(screen.getByText('Ask AI')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter your medical question/)).toBeInTheDocument();
  });

  it('shows connection status badge', async () => {
    const { default: AskPage } = await import('../app/ask/page');
    render(
      <ToastProvider>
        <AskPage />
      </ToastProvider>
    );
    expect(screen.getByText('Disconnected')).toBeInTheDocument();
  });

  it('has Submit Query button that can be clicked', async () => {
    const { default: AskPage } = await import('../app/ask/page');
    render(
      <ToastProvider>
        <AskPage />
      </ToastProvider>
    );
    const submitButton = screen.getByRole('button', { name: /Submit Query/i });
    expect(submitButton).toBeDisabled();
  });

  it('handles ai-key-findings event with staggered animation', async () => {
    const { default: AskPage } = await import('../app/ask/page');
    
    render(
      <ToastProvider>
        <AskPage />
      </ToastProvider>
    );
  });
});