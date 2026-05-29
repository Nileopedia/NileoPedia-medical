import { Notification, NotificationType as PrismaNotificationType, UserRole } from '@prisma/client';
export type NotificationType = PrismaNotificationType;
export interface CreateNotificationDto {
    userId: string;
    title: string;
    message: string;
    type?: NotificationType;
    metadata?: Record<string, unknown>;
}
export interface CreateSystemNotificationDto {
    title: string;
    message: string;
    targetRoles: UserRole[];
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
//# sourceMappingURL=notification.types.d.ts.map