import { Router } from 'express';
import { AdminController } from './controllers/admin.controller';
import { authenticate, authorize } from '../../shared/middleware/auth.middleware';
import { IngestionController } from './controllers/ingestion.controller';
import emailRoutes from '../email/email.routes';

const adminController = new AdminController();
const ingestionController = new IngestionController();

const router: Router = Router();

router.use('/email-status', emailRoutes);

router.get('/users', authenticate, authorize('ADMIN'), adminController.getUsers.bind(adminController));
router.patch('/users/:userId/suspend', authenticate, authorize('ADMIN'), adminController.suspendUser.bind(adminController));
router.patch('/users/:userId/activate', authenticate, authorize('ADMIN'), adminController.activateUser.bind(adminController));
router.delete('/users/:userId', authenticate, authorize('ADMIN'), adminController.deleteUser.bind(adminController));
router.post('/users/:userId/reset-password', authenticate, authorize('ADMIN'), adminController.resetPassword.bind(adminController));
router.get('/validators', authenticate, authorize('ADMIN'), adminController.getValidators.bind(adminController));
router.post('/validators', authenticate, authorize('ADMIN'), adminController.addValidator.bind(adminController));
router.delete('/validators/:validatorId', authenticate, authorize('ADMIN'), adminController.removeValidator.bind(adminController));
router.get('/analytics', authenticate, authorize('ADMIN'), adminController.getAnalytics.bind(adminController));
router.post('/ingestion/run', authenticate, authorize('ADMIN'), ingestionController.runManualIngestion.bind(ingestionController));
router.post('/ingestion/refresh', authenticate, authorize('ADMIN'), ingestionController.runIncrementalRefresh.bind(ingestionController));
router.get('/ingestion/status', authenticate, authorize('ADMIN'), ingestionController.getStatus.bind(ingestionController));
router.get('/performance-test', authenticate, authorize('ADMIN'), adminController.performanceTest.bind(adminController));
router.get('/system-status', authenticate, authorize('ADMIN'), adminController.getSystemStatus.bind(adminController));
router.get('/recent-validations', authenticate, authorize('ADMIN'), adminController.getRecentValidations.bind(adminController));
router.get('/settings', authenticate, authorize('ADMIN'), adminController.getSettings.bind(adminController));
router.put('/settings', authenticate, authorize('ADMIN'), adminController.updateSettings.bind(adminController));
router.get('/ai-activity', authenticate, authorize('ADMIN'), adminController.getAiActivity.bind(adminController));
router.get('/retrieval-test', authenticate, authorize('ADMIN'), adminController.retrievalTest.bind(adminController));
router.get('/rag-debug', authenticate, authorize('ADMIN'), adminController.ragDebug.bind(adminController));

export default router;
