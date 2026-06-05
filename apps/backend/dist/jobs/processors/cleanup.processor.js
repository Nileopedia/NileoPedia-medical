"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processCleanup = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const logger_1 = require("../../config/logger");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
async function processCleanup(job) {
    const { type } = job;
    try {
        switch (type) {
            case 'expired_tokens':
                return await cleanupExpiredTokens();
            case 'failed_jobs':
                return await cleanupFailedJobs();
            case 'temp_files':
                return await cleanupTempFiles();
            case 'audit_logs':
                return await archiveOldAuditLogs();
            default:
                throw new Error(`Unknown cleanup type: ${type}`);
        }
    }
    catch (error) {
        logger_1.logger.error(`Cleanup job failed: ${type}`, error);
        throw error;
    }
}
exports.processCleanup = processCleanup;
async function cleanupExpiredTokens() {
    const result = await prisma_1.default.session.deleteMany({
        where: { expiresAt: { lt: new Date() } },
    });
    logger_1.logger.info(`Cleaned up ${result.count} expired sessions`);
    return { success: true, cleaned: result.count };
}
async function cleanupFailedJobs() {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const result = await prisma_1.default.auditLog.deleteMany({
        where: { createdAt: { lt: oneWeekAgo }, action: 'JOB_FAILED' },
    });
    logger_1.logger.info(`Cleaned up ${result.count} old audit logs`);
    return { success: true, cleaned: result.count };
}
async function cleanupTempFiles() {
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    let cleaned = 0;
    if (fs_1.default.existsSync(uploadDir)) {
        const files = fs_1.default.readdirSync(uploadDir);
        for (const file of files) {
            const filePath = path_1.default.join(uploadDir, file);
            const stat = fs_1.default.statSync(filePath);
            const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
            if (stat.mtime.getTime() < oneDayAgo) {
                fs_1.default.unlinkSync(filePath);
                cleaned++;
            }
        }
    }
    logger_1.logger.info(`Cleaned up ${cleaned} temp files`);
    return { success: true, cleaned };
}
async function archiveOldAuditLogs() {
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const result = await prisma_1.default.auditLog.deleteMany({
        where: { createdAt: { lt: cutoff } },
    });
    logger_1.logger.info(`Archived ${result.count} old audit logs`);
    return { success: true, archived: result.count };
}
//# sourceMappingURL=cleanup.processor.js.map