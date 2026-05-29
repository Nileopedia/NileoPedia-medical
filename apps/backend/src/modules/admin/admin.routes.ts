import { Router } from 'express';
import { AdminController } from './controllers/admin.controller';
import { authenticate, authorize } from '../../shared/middleware/auth.middleware';

const adminController = new AdminController();

const router = Router();

router.get('/users', authenticate, authorize('ADMIN'), adminController.getUsers.bind(adminController));
router.patch('/users/:userId/suspend', authenticate, authorize('ADMIN'), adminController.suspendUser.bind(adminController));
router.patch('/users/:userId/activate', authenticate, authorize('ADMIN'), adminController.activateUser.bind(adminController));
router.delete('/users/:userId', authenticate, authorize('ADMIN'), adminController.deleteUser.bind(adminController));
router.get('/analytics', authenticate, authorize('ADMIN'), adminController.getAnalytics.bind(adminController));

export default router;