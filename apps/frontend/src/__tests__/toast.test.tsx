import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ToastProvider, useToast } from '../components/ui/Toast';

const TestComponent = () => {
  const { addToast } = useToast();
  return (
    <div>
      <button onClick={() => addToast({ type: 'success', title: 'Test Toast' })}>
        Add Toast
      </button>
    </div>
  );
};

describe('Toast component', () => {
  it('renders toast when addToast is called', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );
    expect(screen.getByText('Add Toast')).toBeInTheDocument();
  });

  it('shows toast after clicking button', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );
    fireEvent.click(screen.getByText('Add Toast'));
    expect(await screen.findByText('Test Toast')).toBeInTheDocument();
  });
});

// vi globals are configured in vitest.config.ts via globals: true