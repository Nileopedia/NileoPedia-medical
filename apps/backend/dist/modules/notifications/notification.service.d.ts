import { CreateNotificationDto, CreateSystemNotificationDto, GetNotificationsQuery, GetNotificationsResult } from './notification.types';
export declare class NotificationService {
    getUserNotifications(userId: string, query: GetNotificationsQuery): Promise<GetNotificationsResult>;
    markAsRead(userId: string, notificationId: string): Promise<{
        id: string;
        title: string;
        createdAt: Date;
        message: string;
        type: import("@prisma/client").$Enums.NotificationType;
        userId: string;
        isRead: boolean;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    markAllAsRead(userId: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
    deleteNotification(userId: string, notificationId: string): Promise<{
        id: string;
        title: string;
        createdAt: Date;
        message: string;
        type: import("@prisma/client").$Enums.NotificationType;
        userId: string;
        isRead: boolean;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    createSystemNotification(data: CreateSystemNotificationDto): Promise<{
        count: number;
    }>;
    createNotification(data: CreateNotificationDto): Promise<{
        id: string;
        title: string;
        createdAt: Date;
        message: string;
        type: import("@prisma/client").$Enums.NotificationType;
        userId: string;
        isRead: boolean;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    createBulkNotification(userIds: string[], data: Omit<CreateNotificationDto, 'userId'>): Promise<{
        count: number;
    }>;
}
//# sourceMappingURL=notification.service.d.ts.map