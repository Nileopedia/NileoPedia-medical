"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const audit_controller_1 = require("./audit.controller");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const auditController = new audit_controller_1.AuditController();
const router = (0, express_1.Router)();
// All endpoints require ADMIN except validation activity
router.get('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), auditController.getAuditLogs.bind(auditController));
router.get('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), auditController.getAuditLogById.bind(auditController));
router.get('/user/:userId', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), auditController.getUserActivityLogs.bind(auditController));
router.get('/validation', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN', 'VALIDATOR'), auditController.getValidationActivity.bind(auditController));
router.get('/security', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('ADMIN'), auditController.getSecurityEvents.bind(auditController));
exports.default = router;
//# sourceMappingURL=audit.routes.js.map