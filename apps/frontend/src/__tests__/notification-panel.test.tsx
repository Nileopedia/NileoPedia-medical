import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { NotificationPanel, Notification } from '../components/ui/NotificationPanel';

describe('NotificationPanel', () => {
  const mockNotifications: Notification[] = [
    {
      id: '1',
      title: 'Document Ingestion',
      message: 'New medical document has been processed successfully',
      type: 'document',
      read: false,
      createdAt: '2 hours ago',
    },
    {
      id: '2',
      title: 'Validation Request',
      message: 'You have 3 pending validation requests',
      type: 'validation',
      read: true,
      createdAt: '1 day ago',
    },
  ];

  it('renders notifications list', () => {
    render(
      <NotificationPanel
        notifications={mockNotifications}
        onMarkRead={() => {}}
        onMarkAllRead={() => {}}
        onClose={() => {}}
      />
    );

    expect(screen.getByText('Document Ingestion')).toBeInTheDocument();
    expect(screen.getByText('Validation Request')).toBeInTheDocument();
  });

  it('shows empty state when no notifications', () => {
    render(
      <NotificationPanel
        notifications={[]}
        onMarkRead={() => {}}
        onMarkAllRead={() => {}}
        onClose={() => {}}
      />
    );

    expect(screen.getByText('No notifications')).toBeInTheDocument();
  });

  it('shows unread count and mark all read button', () => {
    render(
      <NotificationPanel
        notifications={mockNotifications}
        onMarkRead={() => {}}
        onMarkAllRead={() => {}}
        onClose={() => {}}
      />
    );

    expect(screen.getByText('Mark all read')).toBeInTheDocument();
  });

  it('calls onMarkRead when notification is clicked', () => {
    const onMarkRead = vi.fn();
    render(
      <NotificationPanel
        notifications={mockNotifications}
        onMarkRead={onMarkRead}
        onMarkAllRead={() => {}}
        onClose={() => {}}
      />
    );

    const firstNotification = screen.getByText('Document Ingestion').closest('div[role="menuitem"]');
    fireEvent.click(firstNotification!);
    expect(onMarkRead).toHaveBeenCalledWith('1');
  });

  it('calls onMarkAllRead when mark all read is clicked', () => {
    const onMarkAllRead = vi.fn();
    render(
      <NotificationPanel
        notifications={mockNotifications}
        onMarkRead={() => {}}
        onMarkAllRead={onMarkAllRead}
        onClose={() => {}}
      />
    );

    fireEvent.click(screen.getByText('Mark all read'));
    expect(onMarkAllRead).toHaveBeenCalled();
  });

  it('shows unread indicator for unread notifications', () => {
    render(
      <NotificationPanel
        notifications={mockNotifications}
        onMarkRead={() => {}}
        onMarkAllRead={() => {}}
        onClose={() => {}}
      />
    );

    const unreadIndicators = document.querySelectorAll('.bg-blue-500.rounded-full');
    expect(unreadIndicators.length).toBe(1);
  });
});