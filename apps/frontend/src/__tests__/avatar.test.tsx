import { render, screen } from '@testing-library/react';
import React from 'react';
import { Avatar } from '../components/ui/Avatar';

describe('Avatar component', () => {
  it('renders with name initials', () => {
    render(<Avatar name="John Doe" />);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('applies size classes correctly', () => {
    const { container } = render(<Avatar name="Test User" size="lg" />);
    expect(container.firstChild).toHaveClass('w-12', 'h-12');
  });
});