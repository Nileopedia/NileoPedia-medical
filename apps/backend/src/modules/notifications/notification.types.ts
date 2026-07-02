import { Notification } from '@prisma/client';

export interface CreateNotificationDto {
  userId: string;
  title: string;
  message: string;
  type?: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'VALIDATION' | 'SYSTEM';
  metadata?: Record<string, unknown>;
}

export interface CreateSystemNotificationDto {
  title: string;
  message: string;
  targetRoles: ('MEDICAL_USER' | 'VALIDATOR' | 'ADMIN')[];
  metadata?: Record<string, unknown>;
}

export interface GetNotificationsQuery {
  page: number;
  limit: number;
}

export interface GetNotificationsResult {
  notifications: Notification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  unreadCount: number;
}
