import { Request, Response, NextFunction } from 'express';
import { NotificationService } from './notification.service';
import { logger } from '../../config/logger';
import { createSystemNotificationSchema, getNotificationsQuerySchema } from './notification.validation';

export class NotificationController {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const query = getNotificationsQuerySchema.parse(req.query);

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
    } catch (error) {
      logger.error('Error in getNotifications controller:', error);
      next(error);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      await this.notificationService.markAsRead(userId, id);

      res.status(200).json({
        success: true,
        message: 'Notification marked as read',
      });
    } catch (error) {
      logger.error('Error in markAsRead controller:', error);
      next(error);
    }
  }

  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      await this.notificationService.markAllAsRead(userId);

      res.status(200).json({
        success: true,
        message: 'All notifications marked as read',
      });
    } catch (error) {
      logger.error('Error in markAllAsRead controller:', error);
      next(error);
    }
  }

  async deleteNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      await this.notificationService.deleteNotification(userId, id);

      res.status(200).json({
        success: true,
        message: 'Notification deleted',
      });
    } catch (error) {
      logger.error('Error in deleteNotification controller:', error);
      next(error);
    }
  }

  async createSystemNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = createSystemNotificationSchema.parse(req.body);

      const result = await this.notificationService.createSystemNotification(validatedData);

      res.status(201).json({
        success: true,
        message: 'System notification created',
        data: { count: result.count },
      });
    } catch (error) {
      logger.error('Error in createSystemNotification controller:', error);
      next(error);
    }
  }
}
