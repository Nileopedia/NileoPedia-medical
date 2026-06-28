"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogger = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
class AuditLogger {
    static async log(req, input) {
        try {
            const data = {
                action: input.action,
            };
            if (input.userId)
                data.userId = input.userId;
            else if (req?.user?.id)
                data.userId = req.user.id;
            if (input.entityType)
                data.entityType = input.entityType;
            if (input.entityId)
                data.entityId = input.entityId;
            if (input.description)
                data.description = input.description;
            if (req?.ip)
                data.ipAddress = req.ip;
            else if (req?.connection?.remoteAddress)
                data.ipAddress = req.connection.remoteAddress;
            if (req?.get) {
                const ua = req.get('user-agent');
                if (ua)
                    data.userAgent = ua;
            }
            if (input.metadata)
                data.metadata = input.metadata;
            await prisma_1.default.auditLog.create({ data });
        }
        catch (error) {
            console.error('Failed to create audit log:', error);
        }
    }
}
exports.AuditLogger = AuditLogger;
//# sourceMappingURL=audit.logger.js.map