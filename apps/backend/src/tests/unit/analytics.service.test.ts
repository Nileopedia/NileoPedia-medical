/* eslint-env jest */
import { AnalyticsService } from '../../modules/analytics/services/analytics.service';
import prisma from '../../config/prisma';

jest.mock('../../config/prisma', () => ({
  user: { count: jest.fn().mockResolvedValue(100) },
  question: { count: jest.fn().mockResolvedValue(500) },
  aIResponse: { count: jest.fn().mockResolvedValue(50) },
  validationReview: { findMany: jest.fn().mockResolvedValue([]) },
}));

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let mockPrisma: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma = prisma as any;
    service = new AnalyticsService();
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