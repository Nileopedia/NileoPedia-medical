import { Router } from 'express';
import { SearchController } from './search.controller';
import { authenticate } from '../../shared/middleware/auth.middleware';

const searchController = new SearchController();

const router: Router = Router();

// All search endpoints are public for now
router.get('/', searchController.globalSearch.bind(searchController));
router.get('/semantic', searchController.semanticSearch.bind(searchController));
router.get('/keyword', searchController.keywordSearch.bind(searchController));
router.get('/hybrid', searchController.hybridSearch.bind(searchController));
router.get('/documents', searchController.searchDocuments.bind(searchController));
router.get('/citations', searchController.searchCitations.bind(searchController));

export default router;
