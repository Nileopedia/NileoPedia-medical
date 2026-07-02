import { Router, RequestHandler } from 'express';
import { CitationController } from './citation.controller';
import { authenticate, authorize } from '../../shared/middleware/auth.middleware';

const citationController = new CitationController();

const router: Router = Router();

// Protected routes - all users can view
router.get('/response/:responseId', authenticate, citationController.getCitationsForResponse.bind(citationController));
router.get('/:id', authenticate, citationController.getCitationById.bind(citationController));
router.get('/search', authenticate, citationController.searchCitations.bind(citationController));

// Admin-only routes
router.post('/', authenticate, authorize('ADMIN'), citationController.createCitation.bind(citationController));
router.patch('/:id', authenticate, authorize('ADMIN'), citationController.updateCitation.bind(citationController));
router.delete('/:id', authenticate, authorize('ADMIN'), citationController.deleteCitation.bind(citationController));

export default router;
