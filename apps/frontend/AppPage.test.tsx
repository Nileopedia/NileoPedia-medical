import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AppPage from '../page';
import { api } from '../../../lib/api';
import { useAppStore } from '../../../store/appStore';

// Mock dependencies
jest.mock('../../../lib/api');
jest.mock('../../../store/appStore');
jest.mock('../../../components/layout/AppLayout', () => ({
  AppLayout: ({ children }: any) => <div>{children}</div>,
}));

describe('AppPage Integration', () => {
  const mockUser = { name: 'Dr. Smith', role: 'MEDICAL_USER' };

  beforeEach(() => {
    (useAppStore as any).mockReturnValue(mockUser);
    (api.askQuestion as jest.Mock).mockResolvedValue({ questionId: '123' });
    (api.getQuestion as jest.Mock).mockResolvedValue({
      id: '123',
      aiResponse: { status: 'pending', summary: 'Processing...' }
    });
  });

  it('performs the full query lifecycle', async () => {
    render(<AppPage />);

    // 1. Verify initial render
    expect(screen.getByText(/Welcome back, Dr. Smith/i)).toBeInTheDocument();

    // 2. Submit a query
    const input = screen.getByPlaceholderText(/Enter your medical question/i);
    fireEvent.change(input, { target: { value: 'What is asthma?' } });
    fireEvent.click(screen.getByRole('button', { name: /Submit Query/i }));

    // 3. Verify it shows the "pending" response viewer
    await waitFor(() => {
      expect(screen.getByText('Processing...')).toBeInTheDocument();
    });

    // 4. Simulate polling update
    (api.getQuestion as jest.Mock).mockResolvedValueOnce({
      aiResponse: { status: 'completed', title: 'Asthma Info', summary: 'Asthma is chronic.', keyFindings: [], citations: [], confidenceScore: 0.9, model: 'Test', generatedAt: new Date().toISOString() }
    });

    // 5. Verify UI updates with final result
    await waitFor(() => {
      expect(screen.getByText('Asthma is chronic.')).toBeInTheDocument();
    }, { timeout: 5000 });
  });
});