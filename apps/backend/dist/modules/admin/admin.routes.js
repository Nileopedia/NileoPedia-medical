"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("./controllers/admin.controller");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const adminController = new admin_controller_1.AdminController();
const router = (0, express_1.Router)();
router.get('/users', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), adminController.getUsers.bind(adminController));
router.patch('/users/:userId/suspend', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), adminController.suspendUser.bind(adminController));
router.patch('/users/:userId/activate', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), adminController.activateUser.bind(adminController));
router.delete('/users/:userId', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), adminController.deleteUser.bind(adminController));
router.get('/analytics', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), adminController.getAnalytics.bind(adminController));
exports.default = router;
//# sourceMappingURL=admin.routes.js.map