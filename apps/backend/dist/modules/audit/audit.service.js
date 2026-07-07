"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
class AuditService {
    async createAuditLog(data) {
        return prisma_1.default.auditLog.create({
            data: {
                userId: data.userId,
                action: data.action,
                entityType: data.entityType,
                entityId: data.entityId,
                description: data.description,
                ipAddress: data.ipAddress,
                userAgent: data.userAgent,
                metadata: data.metadata,
            },
        });
    }
    async getAuditLogs(query) {
        const { page, limit, action, entityType, userId, startDate, endDate, } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (action)
            where.action = action;
        if (entityType)
            where.entityType = entityType;
        if (userId)
            where.userId = userId;
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate)
                where.createdAt.gte = new Date(startDate);
            if (endDate)
                where.createdAt.lte = new Date(endDate);
        }
        const [logs, total] = await Promise.all([
            prisma_1.default.auditLog.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                            role: true,
                        },
                    },
                },
            }),
            prisma_1.default.auditLog.count({ where }),
        ]);
        return {
            logs,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async getAuditLogById(id) {
        return prisma_1.default.auditLog.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        role: true,
                    },
                },
            },
        });
    }
    async getUserActivityLogs(userId, query) {
        const { page, limit } = query;
        const skip = (page - 1) * limit;
        const where = { userId };
        const [logs, total] = await Promise.all([
            prisma_1.default.auditLog.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma_1.default.auditLog.count({ where }),
        ]);
        return {
            logs,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async getValidationActivity(query) {
        const { page, limit } = query;
        const skip = (page - 1) * limit;
        const validationActions = [
            'VALIDATION_APPROVED',
            'VALIDATION_REJECTED',
            'VALIDATION_STARTED',
        ];
        const where = {
            action: { in: validationActions },
        };
        const [logs, total] = await Promise.all([
            prisma_1.default.auditLog.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                            role: true,
                        },
                    },
                },
            }),
            prisma_1.default.auditLog.count({ where }),
        ]);
        return {
            logs,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async getSecurityEvents(query) {
        const { page, limit } = query;
        const skip = (page - 1) * limit;
        const securityActions = [
            'LOGIN_SUCCESS',
            'LOGIN_FAILED',
            'LOGOUT',
            'PASSWORD_CHANGED',
            'ROLE_CHANGED',
            'SUSPICIOUS_ACTIVITY',
            'ACCOUNT_LOCKED',
        ];
        const where = {
            action: { in: securityActions },
        };
        const [logs, total] = await Promise.all([
            prisma_1.default.auditLog.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                            role: true,
                        },
                    },
                },
            }),
            prisma_1.default.auditLog.count({ where }),
        ]);
        return {
            logs,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
}
exports.AuditService = AuditService;
//# sourceMappingURL=audit.service.js.map