"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("./user.controller");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const userController = new user_controller_1.UserController();
const router = (0, express_1.Router)();
// Protected routes (all users)
router.get('/me', auth_middleware_1.authenticate, userController.getCurrentUser.bind(userController));
router.patch('/profile', auth_middleware_1.authenticate, userController.updateProfile.bind(userController));
router.patch('/change-password', auth_middleware_1.authenticate, userController.changePassword.bind(userController));
router.get('/preferences', auth_middleware_1.authenticate, userController.getPreferences.bind(userController));
router.put('/preferences', auth_middleware_1.authenticate, userController.updatePreferences.bind(userController));
// Admin-only routes
router.get('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), userController.getUsers.bind(userController));
router.get('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), userController.getUserById.bind(userController));
router.patch('/:id/deactivate', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), userController.deactivateUser.bind(userController));
router.patch('/:id/activate', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), userController.activateUser.bind(userController));
router.post('/validator', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), userController.createValidator.bind(userController));
exports.default = router;
//# sourceMappingURL=user.routes.js.map