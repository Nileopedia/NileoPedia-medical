"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validation_controller_1 = require("./controllers/validation.controller");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const validationController = new validation_controller_1.ValidationController();
const router = (0, express_1.Router)();
router.get('/pending', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('VALIDATOR', 'ADMIN'), validationController.getPending.bind(validationController));
router.post('/:responseId/approve', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('VALIDATOR', 'ADMIN'), validationController.approve.bind(validationController));
router.post('/:responseId/reject', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('VALIDATOR', 'ADMIN'), validationController.reject.bind(validationController));
router.get('/history', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('VALIDATOR', 'ADMIN'), validationController.getHistory.bind(validationController));
router.get('/:responseId', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('VALIDATOR', 'ADMIN'), validationController.getReview.bind(validationController));
exports.default = router;
//# sourceMappingURL=validation.routes.js.map