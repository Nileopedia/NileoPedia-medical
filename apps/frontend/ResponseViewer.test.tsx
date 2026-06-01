import React from 'react';
import { render, screen } from '@testing-library/react';
import { ResponseViewer } from '../ResponseViewer';
import { AIResponse } from '../../../types';

const mockResponse: AIResponse = {
  id: '1',
  queryId: 'q1',
  title: 'Hypertension Treatment',
  summary: 'This is a summary of the treatment.',
  keyFindings: ['Finding 1', 'Finding 2'],
  detailedExplanation: 'Long explanation here.',
  citations: [{ id: 'c1', text: 'Journal of Medicine', url: 'https://test.com' }],
  status: 'completed',
  confidenceScore: 0.95,
  model: 'GPT-4',
  generatedAt: new Date().toISOString(),
  tags: ['Heart'],
};

describe('ResponseViewer Component', () => {
  it('renders pending status correctly', () => {
    render(<ResponseViewer response={{ ...mockResponse, status: 'pending' }} />);
    expect(screen.getByText('Processing...')).toBeInTheDocument();
    expect(screen.getByText('Finding 1')).toBeInTheDocument();
  });

  it('renders completed status with rich content', () => {
    render(<ResponseViewer response={mockResponse} />);
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('Summary')).toBeInTheDocument();
    expect(screen.getByText(mockResponse.summary)).toBeInTheDocument();
    expect(screen.getByText('95%')).toBeInTheDocument();
  });

  it('renders failed status correctly', () => {
    render(<ResponseViewer response={{ ...mockResponse, status: 'failed' }} />);
    expect(screen.getByText('Failed')).toBeInTheDocument();
    expect(screen.getByText(/Failed to generate a response/i)).toBeInTheDocument();
  });

  it('displays citations and external links', () => {
    render(<ResponseViewer response={mockResponse} />);
    const citationLink = screen.getByRole('link');
    expect(citationLink).toHaveAttribute('href', 'https://test.com');
    expect(screen.getByText('Journal of Medicine')).toBeInTheDocument();
  });
});