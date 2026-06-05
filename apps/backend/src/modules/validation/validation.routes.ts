import { Router } from 'express';
import { ValidationController } from './controllers/validation.controller';
import { authenticate, authorize } from '../../shared/middleware/auth.middleware';

const validationController = new ValidationController();

const router: ReturnType<typeof Router> = Router();

router.get('/pending', authenticate, authorize('VALIDATOR', 'ADMIN'), validationController.getPending.bind(validationController));
router.post('/:responseId/approve', authenticate, authorize('VALIDATOR', 'ADMIN'), validationController.approve.bind(validationController));
router.post('/:responseId/reject', authenticate, authorize('VALIDATOR', 'ADMIN'), validationController.reject.bind(validationController));
router.get('/history', authenticate, authorize('VALIDATOR', 'ADMIN'), validationController.getHistory.bind(validationController));
router.get('/:responseId', authenticate, authorize('VALIDATOR', 'ADMIN'), validationController.getReview.bind(validationController));

export default router;