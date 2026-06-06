import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { vi } from 'vitest';
import { ToastProvider } from '../components/ui/Toast';

// Mock dependencies before importing the component
vi.mock('socket.io-client', () => ({
  io: vi.fn(() => ({
    on: vi.fn(),
    emit: vi.fn(),
    disconnect: vi.fn(),
  })),
}));

vi.mock('../../store/appStore', () => ({
  useAppStore: () => ({ user: { id: 'test-user-id' } }),
}));

vi.mock('../../lib/api', () => ({
  api: {
    askQuestion: vi.fn().mockResolvedValue({ questionId: 'test-question-id' }),
    getQuestion: vi.fn().mockResolvedValue({ aiResponse: null }),
  },
}));

vi.mock('../../components/query/ResponseViewer', () => ({
  ResponseViewer: ({ response }: { response: unknown }) => <div data-testid="response-viewer">Response</div>,
}));

vi.mock('../../components/layout/AppLayout', () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const AskPageWithProviders = async () => {
  const { default: AskPage } = await import('../app/ask/page');
  return (
    <ToastProvider>
      <AskPage />
    </ToastProvider>
  );
};

describe('Ask Page - Socket.IO Streaming', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders Ask AI page with question form', async () => {
    const Component = await AskPageWithProviders();
    render(Component);
    expect(screen.getByText('Ask AI')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter your medical question/)).toBeInTheDocument();
  });

  it('shows connection status badge', async () => {
    const Component = await AskPageWithProviders();
    render(Component);
    expect(screen.getByText('Disconnected')).toBeInTheDocument();
  });

  it('submits question and triggers socket connection', async () => {
    const { io: mockIo } = await import('socket.io-client');
    const Component = await AskPageWithProviders();
    
    render(Component);
    
    const textarea = screen.getByPlaceholderText(/Enter your medical question/);
    fireEvent.change(textarea, { target: { value: 'Test question' } });
    
    const submitButton = screen.getByRole('button', { name: /Submit Query/i });
    fireEvent.click(submitButton);
    
    expect(mockIo).toHaveBeenCalled();
  });

  it('handles ai-key-findings event with staggered animation', async () => {
    const Component = await AskPageWithProviders();
    render(Component);
  });
});