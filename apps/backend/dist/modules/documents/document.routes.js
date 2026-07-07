"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const document_controller_1 = require("./document.controller");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 25 * 1024 * 1024, // 25MB
    },
});
const documentController = new document_controller_1.DocumentController();
const router = (0, express_1.Router)();
// Protected routes - all users can view
router.get('/', auth_middleware_1.authenticate, documentController.getAllDocuments.bind(documentController));
router.get('/:id', auth_middleware_1.authenticate, documentController.getDocumentById.bind(documentController));
router.get('/:id/status', auth_middleware_1.authenticate, documentController.getIngestionStatus.bind(documentController));
// Admin-only routes
router.post('/upload', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), upload.single('file'), documentController.uploadDocument.bind(documentController));
router.patch('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), documentController.updateDocument.bind(documentController));
router.delete('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), documentController.deleteDocument.bind(documentController));
router.patch('/:id/verify', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN', 'VALIDATOR'), documentController.verifyDocument.bind(documentController));
exports.default = router;
//# sourceMappingURL=document.routes.js.map