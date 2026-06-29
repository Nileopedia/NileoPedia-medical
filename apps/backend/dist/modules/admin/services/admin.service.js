"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const prisma_1 = __importDefault(require("../../../config/prisma"));
const audit_logger_1 = require("../../audit/audit.logger");
class AdminService {
    async getUsers(page = 1, limit = 20, search = '') {
        const skip = (page - 1) * limit;
        const where = search
            ? { OR: [{ fullName: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }] }
            : {};
        const [users, total] = await Promise.all([
            prisma_1.default.user.findMany({
                where,
                skip,
                take: limit,
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    role: true,
                    accountStatus: true,
                    createdAt: true,
                },
            }),
            prisma_1.default.user.count({ where }),
        ]);
        return { users, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async suspendUser(userId, adminId) {
        await prisma_1.default.user.update({
            where: { id: userId },
            data: { accountStatus: 'SUSPENDED' },
        });
    }
    async activateUser(userId) {
        await prisma_1.default.user.update({
            where: { id: userId },
            data: { accountStatus: 'ACTIVE' },
        });
    }
    async deleteUser(userId) {
        await prisma_1.default.user.delete({ where: { id: userId } });
    }
    async resetPassword(userId) {
        const user = await prisma_1.default.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new Error('User not found');
        // In production, this would trigger an email with a reset token
        // For now, just return success
        return { success: true };
    }
    async getValidators(page = 1, limit = 20, search = '') {
        const skip = (page - 1) * limit;
        const where = { role: 'VALIDATOR' };
        if (search) {
            where.OR = [
                { fullName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { specialization: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [validators, total] = await Promise.all([
            prisma_1.default.user.findMany({
                where,
                skip,
                take: limit,
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    role: true,
                    specialization: true,
                    institution: true,
                    accountStatus: true,
                },
            }),
            prisma_1.default.user.count({ where }),
        ]);
        const validatorsWithStats = await Promise.all(validators.map(async (v) => {
            const reviews = await prisma_1.default.validationReview.findMany({
                where: { validatorId: v.id },
            });
            const reviewsCompleted = reviews.length;
            const approved = reviews.filter(r => r.status === 'APPROVED').length;
            const approvalRate = reviews.length > 0 ? Math.round((approved / reviews.length) * 100) : 0;
            return {
                ...v,
                reviewsCompleted,
                approvalRate,
            };
        }));
        return { validators: validatorsWithStats, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async addValidator(data) {
        // Check if user exists
        const existing = await prisma_1.default.user.findUnique({ where: { email: data.email } });
        if (existing)
            throw new Error('Email already exists');
        const user = await prisma_1.default.user.create({
            data: {
                fullName: data.fullName,
                email: data.email,
                password: data.password || Math.random().toString(36).substring(2, 15),
                role: 'VALIDATOR',
                specialization: data.specialization,
                institution: data.institution,
                accountStatus: 'ACTIVE',
            },
        });
        return { id: user.id, fullName: user.fullName, email: user.email, role: user.role };
    }
    async removeValidator(validatorId) {
        const user = await prisma_1.default.user.findUnique({ where: { id: validatorId } });
        if (!user || user.role !== 'VALIDATOR')
            throw new Error('Validator not found');
        await prisma_1.default.user.update({
            where: { id: validatorId },
            data: { role: 'MEDICAL_USER', accountStatus: 'SUSPENDED' },
        });
    }
    async getAnalytics() {
        const [totalUsers, totalValidators, totalDocuments, totalResponses, pendingReviews, approvedResponses, rejectedResponses, vectorsCount] = await Promise.all([
            prisma_1.default.user.count({ where: { role: 'MEDICAL_USER' } }),
            prisma_1.default.user.count({ where: { role: 'VALIDATOR' } }),
            prisma_1.default.medicalDocument.count(),
            prisma_1.default.aIResponse.count(),
            prisma_1.default.aIResponse.count({ where: { validationStatus: 'PENDING' } }),
            prisma_1.default.aIResponse.count({ where: { validationStatus: 'APPROVED' } }),
            prisma_1.default.aIResponse.count({ where: { validationStatus: 'REJECTED' } }),
            prisma_1.default.embeddingMetadata.count(),
        ]);
        // Get queries per day (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const questions = await prisma_1.default.question.groupBy({
            by: ['createdAt'],
            where: { createdAt: { gte: sevenDaysAgo } },
            _count: true,
        });
        const queriesPerDay = questions.reduce((acc, q) => {
            const date = q.createdAt.toISOString().split('T')[0];
            acc[date] = (acc[date] || 0) + q._count;
            return acc;
        }, {});
        // Get documents per day
        const documentsPerDay = await prisma_1.default.medicalDocument.groupBy({
            by: ['createdAt'],
            where: { createdAt: { gte: sevenDaysAgo } },
            _count: true,
        });
        const docsPerDayMap = documentsPerDay.reduce((acc, d) => {
            const date = d.createdAt.toISOString().split('T')[0];
            acc[date] = (acc[date] || 0) + d._count;
            return acc;
        }, {});
        // Get validation trends
        const validations = await prisma_1.default.validationReview.groupBy({
            by: ['reviewedAt', 'status'],
            where: { reviewedAt: { gte: sevenDaysAgo } },
            _count: true,
        });
        const validationTrends = validations.reduce((acc, v) => {
            const date = v.reviewedAt.toISOString().split('T')[0];
            if (!acc[date])
                acc[date] = { approved: 0, rejected: 0 };
            if (v.status === 'APPROVED')
                acc[date].approved += v._count;
            else
                acc[date].rejected += v._count;
            return acc;
        }, {});
        return {
            totalUsers,
            totalValidators,
            totalDocuments,
            totalResponses,
            pendingReviews,
            approvedResponses,
            rejectedResponses,
            totalVectors: vectorsCount,
            queriesPerDay,
            documentsPerDay: docsPerDayMap,
            validationTrends,
        };
    }
    async getRecentValidations(limit = 50) {
        const validations = await prisma_1.default.validationReview.findMany({
            take: limit,
            orderBy: { reviewedAt: 'desc' },
            include: {
                aiResponse: { include: { question: true } },
                validator: { select: { id: true, fullName: true, email: true } },
            },
        });
        return validations.map(v => ({
            id: v.id,
            question: v.aiResponse?.question?.questionText || 'Unknown',
            response: v.aiResponse?.summary?.substring(0, 100) || 'No response',
            validator: v.validator?.fullName || 'Unknown',
            decision: v.status.toLowerCase(),
            comments: v.feedback,
            date: v.reviewedAt.toISOString(),
        }));
    }
    async getSettings() {
        // Return default settings since there's no systemSettings table
        return {
            systemNotifications: 'true',
            emailAlerts: 'true',
            autoBackup: 'true',
            maintenanceMode: 'false',
        };
    }
    async updateSettings(settings) {
        // In a real implementation, this would persist to a systemSettings table
        // For now, just log the update
        await audit_logger_1.AuditLogger.log({ session: { userId: null, userRole: 'ADMIN' } }, {
            action: 'ADMIN_UPDATE_SETTINGS',
            entityType: 'Settings',
            description: 'Admin updated system settings',
            metadata: settings,
        });
        return settings;
    }
    async getAiActivity(page = 1, limit = 20, search = '', status = '') {
        const skip = (page - 1) * limit;
        const where = {};
        if (search) {
            where.OR = [
                { question: { questionText: { contains: search, mode: 'insensitive' } } },
            ];
        }
        if (status) {
            where.validationStatus = status.toUpperCase();
        }
        const [activities, total] = await Promise.all([
            prisma_1.default.aIResponse.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    question: true,
                    citations: true,
                },
            }),
            prisma_1.default.aIResponse.count({ where }),
        ]);
        return {
            activities: activities.map(a => ({
                id: a.id,
                question: a.question?.questionText || 'Unknown',
                model: a.generatedBy || 'Unknown',
                responseTime: a.confidenceScore ? 0 : 0,
                documentsUsed: a.citations?.length ?? 0,
                status: a.validationStatus?.toLowerCase() ?? 'pending',
                date: a.createdAt.toISOString(),
            })),
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }
}
exports.AdminService = AdminService;
//# sourceMappingURL=admin.service.js.map