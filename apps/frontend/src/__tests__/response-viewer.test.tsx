import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { vi } from 'vitest';
import { ResponseViewer } from '../components/query/ResponseViewer';
import type { AIResponse } from '../types';

const mockResponse: AIResponse = {
  id: 'resp-1',
  queryId: 'q-1',
  title: 'What are the latest recommendations for managing Type 2 Diabetes in elderly patients?',
  summary: 'Management of type 2 diabetes in elderly patients should be individualized based on cognitive status, life expectancy, and comorbidities.',
  keyRecommendations: [
    'HbA1c target: 7–8%',
    'Metformin as first-line treatment',
    'Minimize hypoglycemia risk',
    'Regular monitoring',
  ],
  sections: {
    treatmentGoals: 'Individualize targets based on health status.',
    lifestyle: 'Diet and exercise modifications.',
    medications: 'Metformin first-line, avoid sulfonylureas.',
    monitoring: 'Regular HbA1c checks.',
  },
  citations: [
    {
      id: 'cit-1',
      title: 'American Diabetes Association Standards of Care',
      authors: 'John Smith et al.',
      journal: 'Diabetes Care',
      year: 2024,
      doi: '10.1234/dc.2024.001',
    },
  ],
  status: 'approved',
  confidenceScore: 0.92,
  model: 'Llama-3.3-70b',
  generatedAt: '2024-03-15T10:30:00Z',
  source: 'real',
  documentsUsed: 6,
  processingTime: 2400,
  tags: [],
};

describe('ResponseViewer', () => {
  it('renders without crashing', () => {
    render(<ResponseViewer response={mockResponse} />);
    expect(screen.getByRole('heading', { name: 'Response' })).toBeInTheDocument();
  });

  it('displays the question', () => {
    render(<ResponseViewer response={mockResponse} />);
    expect(screen.getByText(/What are the latest recommendations for managing Type 2 Diabetes/i)).toBeInTheDocument();
  });

  it('displays clinical summary', () => {
    render(<ResponseViewer response={mockResponse} />);
    expect(screen.getByText('Clinical Summary')).toBeInTheDocument();
    expect(screen.getByText(/individualized based on cognitive status/i)).toBeInTheDocument();
  });

  it('displays key recommendations', () => {
    render(<ResponseViewer response={mockResponse} />);
    expect(screen.getByText('Key Recommendations')).toBeInTheDocument();
    expect(screen.getByText('HbA1c target: 7–8%')).toBeInTheDocument();
    expect(screen.getByText('Metformin as first-line treatment')).toBeInTheDocument();
  });

  it('displays expandable sections', () => {
    render(<ResponseViewer response={mockResponse} />);
    expect(screen.getByText('Treatment Goals')).toBeInTheDocument();
    expect(screen.getByText('Lifestyle Changes')).toBeInTheDocument();
    expect(screen.getByText('Medication Strategies')).toBeInTheDocument();
    expect(screen.getByText('Monitoring')).toBeInTheDocument();
  });

  it('renders expandable accordion for detailed explanation', () => {
    render(<ResponseViewer response={mockResponse} />);

    const treatmentGoalsSummary = screen.getByText('Treatment Goals');
    expect(treatmentGoalsSummary).toBeInTheDocument();

    fireEvent.click(treatmentGoalsSummary);
    expect(screen.getByText('Individualize targets based on health status.')).toBeInTheDocument();
  });

  it('opens selected accordion section on click', async () => {
    render(<ResponseViewer response={mockResponse} />);

    const medications = screen.getByText('Medication Strategies');

    fireEvent.click(medications);
    await waitFor(() => {
      expect(screen.getByText('Metformin first-line, avoid sulfonylureas.')).toBeInTheDocument();
    });
  });

  it('does not display raw AI chunks', () => {
    render(<ResponseViewer response={mockResponse} />);
    expect(screen.queryByText(/Pinecone|chunk|vector/i)).not.toBeInTheDocument();
  });

  it('displays citations with metadata', () => {
    render(<ResponseViewer response={mockResponse} />);
    expect(screen.getByText('Evidence & Citations')).toBeInTheDocument();
    expect(screen.getByText('American Diabetes Association Standards of Care')).toBeInTheDocument();
    expect(screen.getByText('Authors: John Smith et al.')).toBeInTheDocument();
    expect(screen.getByText('Diabetes Care')).toBeInTheDocument();
    expect(screen.getByText('2024')).toBeInTheDocument();
    expect(screen.getByText('DOI: 10.1234/dc.2024.001')).toBeInTheDocument();
  });

  it('shows confidence badge', () => {
    render(<ResponseViewer response={mockResponse} />);
    expect(screen.getByText('92% confidence')).toBeInTheDocument();
  });

  it('displays metadata header for real source', () => {
    render(<ResponseViewer response={mockResponse} />);
    expect(screen.getByText('AI Source: Real Knowledge Base')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
    expect(screen.getByText('2.4s')).toBeInTheDocument();
  });

  it('renders action buttons', () => {
    render(<ResponseViewer response={mockResponse} />);
    expect(screen.getByText('Share')).toBeInTheDocument();
    expect(screen.getByText('Copy')).toBeInTheDocument();
    expect(screen.getByText('Follow-up')).toBeInTheDocument();
    expect(screen.getByText('Export PDF')).toBeInTheDocument();
  });

  it('handles empty sections gracefully', () => {
    const emptySectionsResponse = {
      ...mockResponse,
      sections: {},
      keyRecommendations: [],
    };

    render(<ResponseViewer response={emptySectionsResponse} />);
    expect(screen.queryByText('Detailed Explanation')).not.toBeInTheDocument();
    expect(screen.getByText('Clinical Summary')).toBeInTheDocument();
  });

  it('handles unavailable source', () => {
    const unavailableResponse = {
      ...mockResponse,
      source: 'unavailable' as const,
      summary: 'I could not find supporting medical information in the knowledge base.',
    };

    render(<ResponseViewer response={unavailableResponse} />);
    expect(screen.getByText('AI Source: Unavailable')).toBeInTheDocument();
  });
});
