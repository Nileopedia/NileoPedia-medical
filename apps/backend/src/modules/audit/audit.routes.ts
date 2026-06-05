import { Router } from 'express';
import { AuditController } from './audit.controller';
import { authenticate, authorize } from '../../shared/middleware/auth.middleware';

const auditController = new AuditController();

const router: Router = Router();

// All endpoints require ADMIN except validation activity
router.get('/', authenticate, authorize('ADMIN'), auditController.getAuditLogs.bind(auditController));
router.get('/:id', authenticate, authorize('ADMIN'), auditController.getAuditLogById.bind(auditController));
router.get('/user/:userId', authenticate, authorize('ADMIN'), auditController.getUserActivityLogs.bind(auditController));
router.get('/validation', authenticate, authorize('ADMIN', 'VALIDATOR'), auditController.getValidationActivity.bind(auditController));
router.get('/security', authenticate, authorize('ADMIN'), auditController.getSecurityEvents.bind(auditController));

export default router;