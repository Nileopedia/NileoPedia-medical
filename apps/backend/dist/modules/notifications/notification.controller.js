"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const notification_service_1 = require("./notification.service");
const logger_1 = require("../../config/logger");
const notification_validation_1 = require("./notification.validation");
class NotificationController {
    constructor() {
        this.notificationService = new notification_service_1.NotificationService();
    }
    async getNotifications(req, res, next) {
        try {
            const userId = req.user.id;
            const query = notification_validation_1.getNotificationsQuerySchema.parse(req.query);
            const result = await this.notificationService.getUserNotifications(userId, query);
            res.status(200).json({
                success: true,
                data: {
                    notifications: result.notifications,
                    pagination: {
                        total: result.total,
                        page: result.page,
                        limit: result.limit,
                        totalPages: result.totalPages,
                        unreadCount: result.unreadCount,
                    },
                },
            });
        }
        catch (error) {
            logger_1.logger.error('Error in getNotifications controller:', error);
            next(error);
        }
    }
    async markAsRead(req, res, next) {
        try {
            const userId = req.user.id;
            const { id } = req.params;
            await this.notificationService.markAsRead(userId, id);
            res.status(200).json({
                success: true,
                message: 'Notification marked as read',
            });
        }
        catch (error) {
            logger_1.logger.error('Error in markAsRead controller:', error);
            next(error);
        }
    }
    async markAllAsRead(req, res, next) {
        try {
            const userId = req.user.id;
            await this.notificationService.markAllAsRead(userId);
            res.status(200).json({
                success: true,
                message: 'All notifications marked as read',
            });
        }
        catch (error) {
            logger_1.logger.error('Error in markAllAsRead controller:', error);
            next(error);
        }
    }
    async deleteNotification(req, res, next) {
        try {
            const userId = req.user.id;
            const { id } = req.params;
            await this.notificationService.deleteNotification(userId, id);
            res.status(200).json({
                success: true,
                message: 'Notification deleted',
            });
        }
        catch (error) {
            logger_1.logger.error('Error in deleteNotification controller:', error);
            next(error);
        }
    }
    async createSystemNotification(req, res, next) {
        try {
            const validatedData = notification_validation_1.createSystemNotificationSchema.parse(req.body);
            const result = await this.notificationService.createSystemNotification(validatedData);
            res.status(201).json({
                success: true,
                message: 'System notification created',
                data: { count: result.count },
            });
        }
        catch (error) {
            logger_1.logger.error('Error in createSystemNotification controller:', error);
            next(error);
        }
    }
}
exports.NotificationController = NotificationController;
//# sourceMappingURL=notification.controller.js.map