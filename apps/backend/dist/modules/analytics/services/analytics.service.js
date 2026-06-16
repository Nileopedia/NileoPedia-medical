"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const prisma_1 = __importDefault(require("../../../config/prisma"));
class AnalyticsService {
    async getDashboard() {
        const [totalUsers, totalQuestions, pendingResponses, approvedResponses] = await Promise.all([
            prisma_1.default.user.count(),
            prisma_1.default.question.count(),
            prisma_1.default.aIResponse.count({ where: { validationStatus: 'PENDING' } }),
            prisma_1.default.aIResponse.count({ where: { validationStatus: 'APPROVED' } }),
        ]);
        return {
            totalUsers,
            totalQuestions,
            pendingResponses,
            approvedResponses,
        };
    }
    async getValidationMetrics() {
        const reviews = await prisma_1.default.validationReview.findMany({
            where: { status: 'APPROVED' },
            select: { score: true },
        });
        const avgScore = reviews.length > 0
            ? reviews.reduce((sum, r) => sum + (r.score || 0), 0) / reviews.length
            : 0;
        return {
            totalReviews: reviews.length,
            averageScore: avgScore,
        };
    }
}
exports.AnalyticsService = AnalyticsService;
//# sourceMappingURL=analytics.service.js.map