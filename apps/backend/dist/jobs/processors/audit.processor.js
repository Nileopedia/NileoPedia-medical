"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processAudit = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const logger_1 = require("../../config/logger");
async function processAudit(job) {
    const { userId, action, entityType, entityId, description, ipAddress, userAgent, metadata } = job;
    try {
        const audit = await prisma_1.default.auditLog.create({
            data: {
                userId,
                action,
                entityType,
                entityId,
                description,
                ipAddress,
                userAgent,
                metadata: metadata,
            },
        });
        logger_1.logger.info(`Audit log created: ${action} on ${entityType}`);
        return { success: true, auditId: audit.id };
    }
    catch (error) {
        logger_1.logger.error('Audit log creation failed', error);
        throw error;
    }
}
exports.processAudit = processAudit;
//# sourceMappingURL=audit.processor.js.map