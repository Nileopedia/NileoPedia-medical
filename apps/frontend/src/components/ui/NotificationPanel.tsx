'use client';

import React from 'react';
import { Bell, FileText, CheckCircle, AlertTriangle, Shield, RefreshCw } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'document' | 'validation' | 'ai' | 'alert' | 'security' | 'system';
  read: boolean;
  createdAt: string;
}

interface NotificationPanelProps {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onClose: () => void;
}

const notificationIcons = {
  document: FileText,
  validation: CheckCircle,
  ai: RefreshCw,
  alert: AlertTriangle,
  security: Shield,
  system: AlertTriangle,
};

const notificationColors = {
  document: 'text-blue-500',
  validation: 'text-amber-500',
  ai: 'text-green-500',
  alert: 'text-red-500',
  security: 'text-purple-500',
  system: 'text-slate-500',
};

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onClose,
}) => {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="py-2">
      <div className="px-4 py-2 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllRead}
            className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="px-4 py-8 text-center">
          <Bell className="mx-auto w-8 h-8 text-slate-300 mb-2" />
          <p className="text-sm text-muted-foreground">No notifications</p>
        </div>
      ) : (
        <div className="max-h-96 overflow-y-auto">
          {notifications.map((notification) => {
            const Icon = notificationIcons[notification.type] || AlertTriangle;
            return (
              <div
                key={notification.id}
                className={cn(
                  'px-4 py-3 border-b border-border last:border-0 hover:bg-muted cursor-pointer transition-colors',
                  !notification.read && 'bg-blue-50/50 dark:bg-blue-900/10'
                )}
                onClick={() => onMarkRead(notification.id)}
                role="menuitem"
              >
                <div className="flex gap-3">
                  <Icon className={cn('w-4 h-4 flex-shrink-0 mt-0.5', notificationColors[notification.type])} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      {notification.createdAt}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full self-start mt-1.5 flex-shrink-0" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {notifications.length > 0 && (
        <div className="px-4 py-2 border-t border-border">
          <button
            onClick={onClose}
            className="text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 w-full text-center"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};