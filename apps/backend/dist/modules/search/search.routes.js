"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const search_controller_1 = require("./search.controller");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const searchController = new search_controller_1.SearchController();
const router = (0, express_1.Router)();
// All search endpoints require authentication
router.get('/', auth_middleware_1.authenticate, searchController.globalSearch.bind(searchController));
router.get('/semantic', auth_middleware_1.authenticate, searchController.semanticSearch.bind(searchController));
router.get('/keyword', auth_middleware_1.authenticate, searchController.keywordSearch.bind(searchController));
router.get('/hybrid', auth_middleware_1.authenticate, searchController.hybridSearch.bind(searchController));
router.get('/documents', auth_middleware_1.authenticate, searchController.searchDocuments.bind(searchController));
router.get('/citations', auth_middleware_1.authenticate, searchController.searchCitations.bind(searchController));
exports.default = router;
//# sourceMappingURL=search.routes.js.map