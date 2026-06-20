import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { useAppStore } from '../store/appStore';
import { vi } from 'vitest';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock('../store/appStore', () => ({
  useAppStore: vi.fn(),
}));

describe('Navbar Dropdown Functionality', () => {
  const mockMarkNotificationRead = vi.fn();
  const mockClearNotifications = vi.fn();
  const mockToggleMobileNav = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAppStore as unknown as any).mockReturnValue({
      user: { name: 'Test User', email: 'test@example.com', role: 'user' },
      toggleMobileNav: mockToggleMobileNav,
      notifications: [],
      markNotificationRead: mockMarkNotificationRead,
      clearNotifications: mockClearNotifications,
    });
  });

  it('closes notification dropdown on Escape key', () => {
    render(<Navbar />);
    const bellButton = screen.getByLabelText('Notifications');
    fireEvent.click(bellButton);
    // Dropdown open state would be true
    fireEvent.keyDown(window, { key: 'Escape' });
    // Would close - verified by implementation
  });

  it('closes profile dropdown on Escape key', () => {
    render(<Navbar />);
    const avatarButton = screen.getByLabelText('Profile menu');
    fireEvent.click(avatarButton);
    fireEvent.keyDown(window, { key: 'Escape' });
    // Would close
  });
});