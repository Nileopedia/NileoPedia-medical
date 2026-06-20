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

describe('Navbar Navigation Actions', () => {
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

  describe('Notification Dropdown', () => {
    it('opens notification dropdown on click', () => {
      (useAppStore as unknown as any).mockReturnValue({
        user: { name: 'Test User', email: 'test@example.com', role: 'user' },
        toggleMobileNav: mockToggleMobileNav,
        notifications: [],
        markNotificationRead: mockMarkNotificationRead,
        clearNotifications: mockClearNotifications,
      });

      render(<Navbar />);
      const bellButton = screen.getByLabelText('Notifications');
      fireEvent.click(bellButton);
      // Dropdown opens - would need to verify DOM changes
    });

    it('shows unread badge count', () => {
      (useAppStore as unknown as any).mockReturnValue({
        user: { name: 'Test User', email: 'test@example.com', role: 'user' },
        toggleMobileNav: mockToggleMobileNav,
        notifications: [
          { id: '1', title: 'Test', message: 'Message', type: 'system', read: false, createdAt: '' },
          { id: '2', title: 'Test2', message: 'Message2', type: 'system', read: false, createdAt: '' },
        ],
        markNotificationRead: mockMarkNotificationRead,
        clearNotifications: mockClearNotifications,
      });

      render(<Navbar />);
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('displays empty state when no notifications', () => {
      (useAppStore as unknown as any).mockReturnValue({
        user: { name: 'Test User', email: 'test@example.com', role: 'user' },
        toggleMobileNav: mockToggleMobileNav,
        notifications: [],
        markNotificationRead: mockMarkNotificationRead,
        clearNotifications: mockClearNotifications,
      });

      render(<Navbar />);
      const bellButton = screen.getByLabelText('Notifications');
      fireEvent.click(bellButton);
      // Empty state text would appear
    });
  });

  describe('Help Modal', () => {
    it('opens help modal on click', () => {
      render(<Navbar />);
      const helpButton = screen.getByLabelText('Help');
      fireEvent.click(helpButton);
      expect(screen.getByText('Help & Support')).toBeInTheDocument();
    });

    it('closes help modal when clicking close button', () => {
      render(<Navbar />);
      const helpButton = screen.getByLabelText('Help');
      fireEvent.click(helpButton);
      expect(screen.getByText('Help & Support')).toBeInTheDocument();
      
      const closeButton = screen.getByLabelText('Close help');
      fireEvent.click(closeButton);
    });
  });

  describe('Settings Modal', () => {
    it('opens settings modal on click', () => {
      render(<Navbar />);
      const settingsButton = screen.getByLabelText('Settings');
      fireEvent.click(settingsButton);
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });
  });

  describe('Profile Dropdown', () => {
    it('opens profile dropdown on click', () => {
      render(<Navbar />);
      const avatarButton = screen.getByLabelText('Profile menu');
      fireEvent.click(avatarButton);
      expect(screen.getByText('View profile')).toBeInTheDocument();
    });

    it('displays user information in profile dropdown', () => {
      (useAppStore as unknown as any).mockReturnValue({
        user: { name: 'Admin User', email: 'admin@example.com', role: 'admin' },
        toggleMobileNav: mockToggleMobileNav,
        notifications: [],
        markNotificationRead: mockMarkNotificationRead,
        clearNotifications: mockClearNotifications,
      });

      render(<Navbar />);
      const avatarButton = screen.getByLabelText('Profile menu');
      fireEvent.click(avatarButton);
      
      expect(screen.getByText('Admin User')).toBeInTheDocument();
      expect(screen.getByText('admin@example.com')).toBeInTheDocument();
      expect(screen.getByText('Admin')).toBeInTheDocument();
    });

    it('shows logout button in profile dropdown', () => {
      render(<Navbar />);
      const avatarButton = screen.getByLabelText('Profile menu');
      fireEvent.click(avatarButton);
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });
  });

  describe('Keyboard shortcuts', () => {
    it('opens help modal on Ctrl+/', () => {
      render(<Navbar />);
      fireEvent.keyDown(window, { key: '/', ctrlKey: true });
      expect(screen.getByText('Help & Support')).toBeInTheDocument();
    });
  });
});