import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ProfileDropdown } from '../components/ui/ProfileDropdown';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('ProfileDropdown', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders user information', () => {
    render(
      <ProfileDropdown
        userName="John Doe"
        userEmail="john@example.com"
        userRole="admin"
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('shows view profile action', () => {
    render(
      <ProfileDropdown
        userName="Test User"
        userEmail="test@example.com"
        userRole="user"
      />
    );

    expect(screen.getByText('View profile')).toBeInTheDocument();
  });

  it('shows edit profile action', () => {
    render(
      <ProfileDropdown
        userName="Test User"
        userEmail="test@example.com"
        userRole="user"
      />
    );

    expect(screen.getByText('Edit profile')).toBeInTheDocument();
  });

  it('shows my activity action', () => {
    render(
      <ProfileDropdown
        userName="Test User"
        userEmail="test@example.com"
        userRole="user"
      />
    );

    expect(screen.getByText('My activity')).toBeInTheDocument();
  });

  it('shows logout button', () => {
    render(
      <ProfileDropdown
        userName="Test User"
        userEmail="test@example.com"
        userRole="user"
      />
    );

    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('calls logout when logout button clicked', () => {
    const localStorageMock = {
      removeItem: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });

    render(
      <ProfileDropdown
        userName="Test User"
        userEmail="test@example.com"
        userRole="user"
      />
    );

    fireEvent.click(screen.getByText('Logout'));
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
  });
});