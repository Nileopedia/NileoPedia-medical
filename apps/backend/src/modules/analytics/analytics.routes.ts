import { Router } from 'express';
import { AnalyticsController } from './controllers/analytics.controller';
import { authenticate } from '../../shared/middleware/auth.middleware';

const analyticsController = new AnalyticsController();

const router = Router();

router.get('/dashboard', authenticate, analyticsController.getDashboard.bind(analyticsController));
router.get('/validation', authenticate, analyticsController.getValidationMetrics.bind(analyticsController));

export default router;