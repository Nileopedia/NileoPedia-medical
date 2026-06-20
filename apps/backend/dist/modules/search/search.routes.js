"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const search_controller_1 = require("./search.controller");
const searchController = new search_controller_1.SearchController();
const router = (0, express_1.Router)();
// All search endpoints are public for now
router.get('/', searchController.globalSearch.bind(searchController));
router.get('/semantic', searchController.semanticSearch.bind(searchController));
router.get('/keyword', searchController.keywordSearch.bind(searchController));
router.get('/hybrid', searchController.hybridSearch.bind(searchController));
router.get('/documents', searchController.searchDocuments.bind(searchController));
router.get('/citations', searchController.searchCitations.bind(searchController));
exports.default = router;
//# sourceMappingURL=search.routes.js.map