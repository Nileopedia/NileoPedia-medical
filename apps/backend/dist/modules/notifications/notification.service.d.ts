import { CreateNotificationDto, CreateSystemNotificationDto, GetNotificationsQuery, GetNotificationsResult } from './notification.types';
export declare class NotificationService {
    getUserNotifications(userId: string, query: GetNotificationsQuery): Promise<GetNotificationsResult>;
    markAsRead(userId: string, notificationId: string): Promise<{
        id: string;
        userId: string;
        metadata: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        type: import("@prisma/client").$Enums.NotificationType;
        message: string;
        title: string;
        isRead: boolean;
    }>;
    markAllAsRead(userId: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
    deleteNotification(userId: string, notificationId: string): Promise<{
        id: string;
        userId: string;
        metadata: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        type: import("@prisma/client").$Enums.NotificationType;
        message: string;
        title: string;
        isRead: boolean;
    }>;
    createSystemNotification(data: CreateSystemNotificationDto): Promise<{
        count: number;
    }>;
    createNotification(data: CreateNotificationDto): Promise<{
        id: string;
        userId: string;
        metadata: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        type: import("@prisma/client").$Enums.NotificationType;
        message: string;
        title: string;
        isRead: boolean;
    }>;
    createBulkNotification(userIds: string[], data: Omit<CreateNotificationDto, 'userId'>): Promise<{
        count: number;
    }>;
}
//# sourceMappingURL=notification.service.d.ts.map