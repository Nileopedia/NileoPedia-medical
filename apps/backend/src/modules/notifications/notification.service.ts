import prisma from '../../config/prisma';
import { NotificationType } from '@prisma/client';
import {
  CreateNotificationDto,
  CreateSystemNotificationDto,
  GetNotificationsQuery,
  GetNotificationsResult,
} from './notification.types';

export class NotificationService {
  async getUserNotifications(userId: string, query: GetNotificationsQuery): Promise<GetNotificationsResult> {
    const { page, limit } = query;
    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where: { userId } }),
      prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    return {
      notifications,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      unreadCount,
    };
  }

  async markAsRead(userId: string, notificationId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new Error('Unauthorized access');
    }

    return prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async deleteNotification(userId: string, notificationId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new Error('Unauthorized access');
    }

    return prisma.notification.delete({
      where: { id: notificationId },
    });
  }

  async createSystemNotification(data: CreateSystemNotificationDto) {
    const users = await prisma.user.findMany({
      where: {
        role: { in: data.targetRoles },
      },
      select: { id: true },
    });

    const notifications = users.map((user) => ({
      userId: user.id,
      title: data.title,
      message: data.message,
      type: NotificationType.SYSTEM,
      metadata: data.metadata as any,
    }));

    if (notifications.length > 0) {
      await prisma.notification.createMany({
        data: notifications,
      });
    }

    return { count: notifications.length };
  }

  async createNotification(data: CreateNotificationDto) {
    return prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: (data.type || 'INFO') as NotificationType,
        metadata: data.metadata as any,
      },
    });
  }

  async createBulkNotification(userIds: string[], data: Omit<CreateNotificationDto, 'userId'>) {
    const notifications = userIds.map((userId) => ({
      userId,
      title: data.title,
      message: data.message,
      type: (data.type || 'INFO') as NotificationType,
      metadata: data.metadata as any,
    }));

    if (notifications.length > 0) {
      await prisma.notification.createMany({
        data: notifications,
      });
    }

    return { count: notifications.length };
  }
}