import { Router } from 'express';
import { UserController } from './user.controller';
import { authenticate, authorize } from '../../shared/middleware/auth.middleware';

const userController = new UserController();

const router = Router();

// Protected routes (all users)
router.get('/me', authenticate, userController.getCurrentUser.bind(userController));
router.patch('/profile', authenticate, userController.updateProfile.bind(userController));
router.patch('/change-password', authenticate, userController.changePassword.bind(userController));

// Admin-only routes
router.get('/', authenticate, authorize('ADMIN'), userController.getUsers.bind(userController));
router.get('/:id', authenticate, authorize('ADMIN'), userController.getUserById.bind(userController));
router.patch('/:id/deactivate', authenticate, authorize('ADMIN'), userController.deactivateUser.bind(userController));
router.patch('/:id/activate', authenticate, authorize('ADMIN'), userController.activateUser.bind(userController));

export default router;