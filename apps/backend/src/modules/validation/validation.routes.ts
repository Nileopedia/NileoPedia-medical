import { Router } from 'express';
import { ValidationController } from './controllers/validation.controller';
import { authenticate, authorize } from '../../shared/middleware/auth.middleware';

const validationController = new ValidationController();

const router: ReturnType<typeof Router> = Router();

router.get('/pending', authenticate, authorize('VALIDATOR', 'ADMIN'), validationController.getPending.bind(validationController));
router.post('/:responseId/approve', authenticate, authorize('VALIDATOR', 'ADMIN'), validationController.approve.bind(validationController));
router.post('/:responseId/reject', authenticate, authorize('VALIDATOR', 'ADMIN'), validationController.reject.bind(validationController));
router.get('/history', authenticate, authorize('VALIDATOR', 'ADMIN'), validationController.getHistory.bind(validationController));
router.get('/approved', authenticate, authorize('VALIDATOR', 'ADMIN'), validationController.getApproved.bind(validationController));
router.get('/rejected', authenticate, authorize('VALIDATOR', 'ADMIN'), validationController.getRejected.bind(validationController));
router.get('/feedback', authenticate, authorize('VALIDATOR', 'ADMIN'), validationController.getFeedbackReports.bind(validationController));
router.patch('/feedback/:reportId', authenticate, authorize('VALIDATOR', 'ADMIN'), validationController.updateFeedbackReport.bind(validationController));
router.get('/profile', authenticate, authorize('VALIDATOR', 'ADMIN'), validationController.getProfile.bind(validationController));
router.put('/profile', authenticate, authorize('VALIDATOR', 'ADMIN'), validationController.updateProfile.bind(validationController));
router.get('/settings', authenticate, authorize('VALIDATOR', 'ADMIN'), validationController.getSettings.bind(validationController));
router.put('/settings', authenticate, authorize('VALIDATOR', 'ADMIN'), validationController.updateSettings.bind(validationController));
router.get('/:responseId', authenticate, authorize('VALIDATOR', 'ADMIN'), validationController.getReview.bind(validationController));

export default router;
