import { CreateNotificationDto, CreateSystemNotificationDto, GetNotificationsQuery, GetNotificationsResult } from './notification.types';
export declare class NotificationService {
    getUserNotifications(userId: string, query: GetNotificationsQuery): Promise<GetNotificationsResult>;
    markAsRead(userId: string, notificationId: string): Promise<{
        message: string;
        type: import("@prisma/client").$Enums.NotificationType;
        id: string;
        userId: string;
        createdAt: Date;
        title: string;
        isRead: boolean;
        metadata: import("@prisma/client/runtime/library").JsonValue;
    }>;
    markAllAsRead(userId: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
    deleteNotification(userId: string, notificationId: string): Promise<{
        message: string;
        type: import("@prisma/client").$Enums.NotificationType;
        id: string;
        userId: string;
        createdAt: Date;
        title: string;
        isRead: boolean;
        metadata: import("@prisma/client/runtime/library").JsonValue;
    }>;
    createSystemNotification(data: CreateSystemNotificationDto): Promise<{
        count: number;
    }>;
    createNotification(data: CreateNotificationDto): Promise<{
        message: string;
        type: import("@prisma/client").$Enums.NotificationType;
        id: string;
        userId: string;
        createdAt: Date;
        title: string;
        isRead: boolean;
        metadata: import("@prisma/client/runtime/library").JsonValue;
    }>;
    createBulkNotification(userIds: string[], data: Omit<CreateNotificationDto, 'userId'>): Promise<{
        count: number;
    }>;
}
//# sourceMappingURL=notification.service.d.ts.map