"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../../config/prisma"));
class NotificationService {
    async getUserNotifications(userId, query) {
        const { page, limit } = query;
        const skip = (page - 1) * limit;
        const [notifications, total, unreadCount] = await Promise.all([
            prisma_1.default.notification.findMany({
                where: { userId },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma_1.default.notification.count({ where: { userId } }),
            prisma_1.default.notification.count({ where: { userId, isRead: false } }),
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
    async markAsRead(userId, notificationId) {
        const notification = await prisma_1.default.notification.findUnique({
            where: { id: notificationId },
        });
        if (!notification) {
            throw new Error('Notification not found');
        }
        if (notification.userId !== userId) {
            throw new Error('Unauthorized access');
        }
        return prisma_1.default.notification.update({
            where: { id: notificationId },
            data: { isRead: true },
        });
    }
    async markAllAsRead(userId) {
        return prisma_1.default.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
    }
    async deleteNotification(userId, notificationId) {
        const notification = await prisma_1.default.notification.findUnique({
            where: { id: notificationId },
        });
        if (!notification) {
            throw new Error('Notification not found');
        }
        if (notification.userId !== userId) {
            throw new Error('Unauthorized access');
        }
        return prisma_1.default.notification.delete({
            where: { id: notificationId },
        });
    }
    async createSystemNotification(data) {
        const users = await prisma_1.default.user.findMany({
            where: {
                role: { in: data.targetRoles },
            },
            select: { id: true },
        });
        const notifications = users.map((user) => ({
            userId: user.id,
            title: data.title,
            message: data.message,
            type: client_1.NotificationType.SYSTEM,
            metadata: data.metadata,
        }));
        if (notifications.length > 0) {
            await prisma_1.default.notification.createMany({
                data: notifications,
            });
        }
        return { count: notifications.length };
    }
    async createNotification(data) {
        return prisma_1.default.notification.create({
            data: {
                userId: data.userId,
                title: data.title,
                message: data.message,
                type: (data.type || 'INFO'),
                metadata: data.metadata,
            },
        });
    }
    async createBulkNotification(userIds, data) {
        const notifications = userIds.map((userId) => ({
            userId,
            title: data.title,
            message: data.message,
            type: (data.type || 'INFO'),
            metadata: data.metadata,
        }));
        if (notifications.length > 0) {
            await prisma_1.default.notification.createMany({
                data: notifications,
            });
        }
        return { count: notifications.length };
    }
}
exports.NotificationService = NotificationService;
//# sourceMappingURL=notification.service.js.map