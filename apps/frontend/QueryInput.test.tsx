import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryInput } from '../QueryInput';

describe('QueryInput Component', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('renders correctly', () => {
    render(<QueryInput onSubmit={mockOnSubmit} />);
    expect(screen.getByPlaceholderText(/Enter your medical question/i)).toBeInTheDocument();
  });

  it('updates input value on change', () => {
    render(<QueryInput onSubmit={mockOnSubmit} />);
    const textarea = screen.getByPlaceholderText(/Enter your medical question/i);
    fireEvent.change(textarea, { target: { value: 'How to treat hypertension?' } });
    expect(textarea).toHaveValue('How to treat hypertension?');
  });

  it('calls onSubmit with the query and clears input', () => {
    render(<QueryInput onSubmit={mockOnSubmit} />);
    const textarea = screen.getByPlaceholderText(/Enter your medical question/i);
    const button = screen.getByRole('button', { name: /Submit Query/i });

    fireEvent.change(textarea, { target: { value: 'Test query' } });
    fireEvent.click(button);

    expect(mockOnSubmit).toHaveBeenCalledWith('Test query');
    expect(textarea).toHaveValue('');
  });

  it('disables button when loading', () => {
    render(<QueryInput onSubmit={mockOnSubmit} loading={true} />);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByText(/Generating Response.../i)).toBeInTheDocument();
  });
});