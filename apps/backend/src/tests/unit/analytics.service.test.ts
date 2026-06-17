/* eslint-env jest */
import { AnalyticsService } from '../../modules/analytics/services/analytics.service';
import prisma from '../../config/prisma';

jest.mock('../../config/prisma', () => ({
  user: { count: jest.fn() },
  question: { count: jest.fn() },
  aIResponse: { count: jest.fn() },
  validationReview: { findMany: jest.fn() },
}));

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let mockPrisma: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma = prisma as any;
    service = new AnalyticsService();
  });

  describe('getDashboard', () => {
    it('should return dashboard metrics', async () => {
      mockPrisma.user.count.mockResolvedValue(100);
      mockPrisma.question.count.mockResolvedValue(500);
      mockPrisma.aIResponse.count.mockResolvedValue(50);

      const result = await service.getDashboard();

      expect(result).toHaveProperty('totalUsers', 100);
      expect(result).toHaveProperty('totalQuestions', 500);
    });
  });

  describe('getValidationMetrics', () => {
    it('should return validation metrics with reviews', async () => {
      mockPrisma.validationReview.findMany.mockResolvedValue([
        { score: 5 },
        { score: 4 },
      ]);

      const result = await service.getValidationMetrics();

      expect(result.totalReviews).toBe(2);
      expect(result.averageScore).toBeGreaterThan(0);
    });

    it('should return zero when no reviews', async () => {
      mockPrisma.validationReview.findMany.mockResolvedValue([]);

      const result = await service.getValidationMetrics();

      expect(result.totalReviews).toBe(0);
      expect(result.averageScore).toBe(0);
    });
  });
});