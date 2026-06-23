import { Router } from 'express';
import { AdminController } from './controllers/admin.controller';
import { authenticate, authorize } from '../../shared/middleware/auth.middleware';
import { IngestionController } from './controllers/ingestion.controller';

const adminController = new AdminController();
const ingestionController = new IngestionController();

const router: Router = Router();

router.get('/users', authenticate, authorize('ADMIN'), adminController.getUsers.bind(adminController));
router.patch('/users/:userId/suspend', authenticate, authorize('ADMIN'), adminController.suspendUser.bind(adminController));
router.patch('/users/:userId/activate', authenticate, authorize('ADMIN'), adminController.activateUser.bind(adminController));
router.delete('/users/:userId', authenticate, authorize('ADMIN'), adminController.deleteUser.bind(adminController));
router.get('/analytics', authenticate, authorize('ADMIN'), adminController.getAnalytics.bind(adminController));
router.post('/ingestion/run', authenticate, authorize('ADMIN'), ingestionController.runManualIngestion.bind(ingestionController));
router.post('/ingestion/refresh', authenticate, authorize('ADMIN'), ingestionController.runIncrementalRefresh.bind(ingestionController));
router.get('/ingestion/status', authenticate, authorize('ADMIN'), ingestionController.getStatus.bind(ingestionController));
router.get('/performance-test', authenticate, authorize('ADMIN'), adminController.performanceTest.bind(adminController));
router.get('/system-status', authenticate, authorize('ADMIN'), adminController.getSystemStatus.bind(adminController));

export default router;