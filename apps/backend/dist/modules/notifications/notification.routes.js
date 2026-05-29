"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_controller_1 = require("./notification.controller");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const notificationController = new notification_controller_1.NotificationController();
const router = (0, express_1.Router)();
// Protected routes (all users)
router.get('/', auth_middleware_1.authenticate, notificationController.getNotifications.bind(notificationController));
router.patch('/:id/read', auth_middleware_1.authenticate, notificationController.markAsRead.bind(notificationController));
router.patch('/read-all', auth_middleware_1.authenticate, notificationController.markAllAsRead.bind(notificationController));
router.delete('/:id', auth_middleware_1.authenticate, notificationController.deleteNotification.bind(notificationController));
// Admin-only routes
router.post('/system', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), notificationController.createSystemNotification.bind(notificationController));
exports.default = router;
//# sourceMappingURL=notification.routes.js.map