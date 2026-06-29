import { render, screen } from '@testing-library/react';
import React from 'react';
import { vi } from 'vitest';

vi.mock('../../store/appStore', () => ({
  useAppStore: () => ({
    user: { id: 'test-user-id', role: 'validator' },
    isInitialized: true,
  }),
}));

vi.mock('../../lib/api', () => ({
  api: {
    getPendingReviews: vi.fn().mockResolvedValue([]),
    getValidationHistory: vi.fn().mockResolvedValue({ reviews: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 1 } }),
    approveReview: vi.fn().mockResolvedValue(undefined),
    rejectReview: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('../../components/layout/AppLayout', () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <div data-testid="app-layout">{children}</div>,
}));

vi.mock('../../components/layout/Navbar', () => ({
  Navbar: () => <div data-testid="navbar">Navbar</div>,
}));

describe('Validator Page - FR-19', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Validation Center page with tabs', async () => {
    const { default: ValidatorPage } = await import('../app/validator/page');
    render(<ValidatorPage />);
    expect(screen.getByText('Validation Center')).toBeInTheDocument();
    expect(screen.getByText(/Pending Reviews/)).toBeInTheDocument();
    expect(screen.getByText(/Validation History/)).toBeInTheDocument();
  });
});