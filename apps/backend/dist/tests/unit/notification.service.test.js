"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const notification_service_1 = require("../../modules/notifications/notification.service");
const prisma_1 = __importDefault(require("../../config/prisma"));
jest.mock('../../config/prisma', () => ({
    __esModule: true,
    default: {
        notification: {
            findMany: jest.fn(),
            count: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            updateMany: jest.fn(),
            delete: jest.fn(),
            createMany: jest.fn(),
        },
        user: {
            findMany: jest.fn(),
        },
    },
}));
describe('NotificationService', () => {
    let notificationService;
    const mockPrisma = prisma_1.default;
    beforeEach(() => {
        notificationService = new notification_service_1.NotificationService();
        jest.clearAllMocks();
    });
    describe('getUserNotifications', () => {
        it('should return notifications with pagination metadata', async () => {
            const mockNotifications = [
                { id: '1', userId: 'user-1', title: 'Test', message: 'Message', isRead: false, type: client_1.NotificationType.INFO, createdAt: new Date() },
            ];
            mockPrisma.notification.findMany.mockResolvedValue(mockNotifications);
            mockPrisma.notification.count.mockResolvedValue(1);
            mockPrisma.notification.count.mockResolvedValue(0);
            const result = await notificationService.getUserNotifications('user-1', { page: 1, limit: 20 });
            expect(result).toEqual({
                notifications: mockNotifications,
                total: 1,
                page: 1,
                limit: 20,
                totalPages: 1,
                unreadCount: 0,
            });
        });
    });
    describe('markAsRead', () => {
        it('should mark notification as read', async () => {
            const mockNotification = { id: '1', userId: 'user-1', title: 'Test', isRead: false };
            const updatedNotification = { ...mockNotification, isRead: true };
            mockPrisma.notification.findUnique.mockResolvedValue(mockNotification);
            mockPrisma.notification.update.mockResolvedValue(updatedNotification);
            const result = await notificationService.markAsRead('user-1', '1');
            expect(result.isRead).toBe(true);
            expect(mockPrisma.notification.update).toHaveBeenCalledWith({
                where: { id: '1' },
                data: { isRead: true },
            });
        });
        it('should throw error if notification not found', async () => {
            mockPrisma.notification.findUnique.mockResolvedValue(null);
            await expect(notificationService.markAsRead('user-1', 'nonexistent')).rejects.toThrow('Notification not found');
        });
        it('should throw error if user not authorized', async () => {
            mockPrisma.notification.findUnique.mockResolvedValue({ id: '1', userId: 'other-user' });
            await expect(notificationService.markAsRead('user-1', '1')).rejects.toThrow('Unauthorized access');
        });
    });
    describe('markAllAsRead', () => {
        it('should mark all user notifications as read', async () => {
            mockPrisma.notification.updateMany.mockResolvedValue({ count: 5 });
            await notificationService.markAllAsRead('user-1');
            expect(mockPrisma.notification.updateMany).toHaveBeenCalledWith({
                where: { userId: 'user-1', isRead: false },
                data: { isRead: true },
            });
        });
    });
    describe('createSystemNotification', () => {
        it('should create notifications for all users with specified roles', async () => {
            mockPrisma.user.findMany.mockResolvedValue([
                { id: 'user-1' },
                { id: 'user-2' },
            ]);
            mockPrisma.notification.createMany.mockResolvedValue({ count: 2 });
            const result = await notificationService.createSystemNotification({
                title: 'System Alert',
                message: 'Test message',
                targetRoles: ['MEDICAL_USER', 'VALIDATOR'],
            });
            expect(result.count).toBe(2);
            expect(mockPrisma.notification.createMany).toHaveBeenCalled();
        });
    });
});
//# sourceMappingURL=notification.service.test.js.map