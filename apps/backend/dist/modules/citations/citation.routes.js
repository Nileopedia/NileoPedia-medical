"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const citation_controller_1 = require("./citation.controller");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const citationController = new citation_controller_1.CitationController();
const router = (0, express_1.Router)();
// Protected routes - all users can view
router.get('/response/:responseId', auth_middleware_1.authenticate, citationController.getCitationsForResponse.bind(citationController));
router.get('/:id', auth_middleware_1.authenticate, citationController.getCitationById.bind(citationController));
router.get('/search', auth_middleware_1.authenticate, citationController.searchCitations.bind(citationController));
// Admin-only routes
router.post('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), citationController.createCitation.bind(citationController));
router.patch('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), citationController.updateCitation.bind(citationController));
router.delete('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), citationController.deleteCitation.bind(citationController));
exports.default = router;
//# sourceMappingURL=citation.routes.js.map