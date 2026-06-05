import { Router } from 'express';
import { SearchController } from './search.controller';
import { authenticate } from '../../shared/middleware/auth.middleware';

const searchController = new SearchController();

const router: Router = Router();

// All search endpoints require authentication
router.get('/', authenticate, searchController.globalSearch.bind(searchController));
router.get('/semantic', authenticate, searchController.semanticSearch.bind(searchController));
router.get('/keyword', authenticate, searchController.keywordSearch.bind(searchController));
router.get('/hybrid', authenticate, searchController.hybridSearch.bind(searchController));
router.get('/documents', authenticate, searchController.searchDocuments.bind(searchController));
router.get('/citations', authenticate, searchController.searchCitations.bind(searchController));

export default router;