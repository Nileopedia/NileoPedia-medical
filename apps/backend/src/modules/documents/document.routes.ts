import { Router } from 'express';
import multer from 'multer';
import { DocumentController } from './document.controller';
import { authenticate, authorize } from '../../shared/middleware/auth.middleware';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB
  },
});

const documentController = new DocumentController();

const router: Router = Router();

// Protected routes - all users can view
router.get('/', authenticate, documentController.getAllDocuments.bind(documentController));
router.get('/:id', authenticate, documentController.getDocumentById.bind(documentController));
router.get('/:id/status', authenticate, documentController.getIngestionStatus.bind(documentController));

// Admin-only routes
router.post('/upload', authenticate, authorize('ADMIN'), upload.single('file'), documentController.uploadDocument.bind(documentController));
router.patch('/:id', authenticate, authorize('ADMIN'), documentController.updateDocument.bind(documentController));
router.delete('/:id', authenticate, authorize('ADMIN'), documentController.deleteDocument.bind(documentController));
router.patch('/:id/verify', authenticate, authorize('ADMIN', 'VALIDATOR'), documentController.verifyDocument.bind(documentController));

export default router;
