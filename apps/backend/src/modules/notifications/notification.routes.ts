import { Router } from 'express';
import { NotificationController } from './notification.controller';
import { authenticate, authorize } from '../../shared/middleware/auth.middleware';

const notificationController = new NotificationController();

const router = Router();

// Protected routes (all users)
router.get('/', authenticate, notificationController.getNotifications.bind(notificationController));
router.patch('/:id/read', authenticate, notificationController.markAsRead.bind(notificationController));
router.patch('/read-all', authenticate, notificationController.markAllAsRead.bind(notificationController));
router.delete('/:id', authenticate, notificationController.deleteNotification.bind(notificationController));

// Admin-only routes
router.post('/system', authenticate, authorize('ADMIN'), notificationController.createSystemNotification.bind(notificationController));

export default router;