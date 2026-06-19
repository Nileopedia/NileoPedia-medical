"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-env jest */
const analytics_service_1 = require("../../modules/analytics/services/analytics.service");
const prisma_1 = __importDefault(require("../../config/prisma"));
jest.mock('../../config/prisma', () => ({
    user: { count: jest.fn().mockResolvedValue(100) },
    question: { count: jest.fn().mockResolvedValue(500) },
    aIResponse: { count: jest.fn().mockResolvedValue(50) },
    validationReview: { findMany: jest.fn().mockResolvedValue([]) },
}));
describe('AnalyticsService', () => {
    let service;
    let mockPrisma;
    beforeEach(() => {
        jest.clearAllMocks();
        mockPrisma = prisma_1.default;
        service = new analytics_service_1.AnalyticsService();
    });
    it('should return dashboard metrics', async () => {
        const result = await service.getDashboard();
        expect(result).toEqual({
            totalUsers: 100,
            totalQuestions: 500,
            pendingResponses: 50,
            approvedResponses: 50,
        });
    });
    it('should return validation metrics with reviews', async () => {
        mockPrisma.validationReview.findMany.mockResolvedValue([{ score: 5 }, { score: 4 }]);
        const result = await service.getValidationMetrics();
        expect(result.totalReviews).toBe(2);
        expect(result.averageScore).toBe(4.5);
    });
    it('should return zero average when no reviews', async () => {
        mockPrisma.validationReview.findMany.mockResolvedValue([]);
        const result = await service.getValidationMetrics();
        expect(result.averageScore).toBe(0);
    });
});
//# sourceMappingURL=analytics.service.test.js.map