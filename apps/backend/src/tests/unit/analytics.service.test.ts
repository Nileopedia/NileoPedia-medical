/* eslint-env jest */
import { AnalyticsService } from '../../modules/analytics/services/analytics.service';
import prisma from '../../config/prisma';

jest.mock('../../config/prisma', () => ({
  user: { count: jest.fn() },
  question: { count: jest.fn(), findMany: jest.fn(), groupBy: jest.fn() },
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

  it('should return admin dashboard metrics', async () => {
    mockPrisma.user.count.mockResolvedValue(100);
    mockPrisma.question.count.mockResolvedValue(500);
    mockPrisma.aIResponse.count
      .mockResolvedValueOnce(50)
      .mockResolvedValueOnce(200);

    const result = await service.getDashboard();

    expect(result).toEqual({
      totalUsers: 100,
      totalQuestions: 500,
      pendingResponses: 50,
      approvedResponses: 200,
    });
  });

  it('should return user dashboard with real data', async () => {
    mockPrisma.question.count.mockResolvedValueOnce(25);
    mockPrisma.question.count.mockResolvedValueOnce(5);
    mockPrisma.aIResponse.count.mockResolvedValue(20);
    mockPrisma.question.findMany.mockResolvedValue([
      {
        id: 'q-1',
        questionText: 'What is diabetes?',
        category: 'endocrinology',
        createdAt: new Date('2025-01-15'),
        updatedAt: new Date('2025-01-15'),
        isSaved: true,
        aiResponse: {
          id: 'resp-1',
          validationStatus: 'APPROVED',
          confidenceScore: 0.92,
          citations: [],
        },
      },
      {
        id: 'q-2',
        questionText: 'Hypertension treatment',
        category: 'cardiology',
        createdAt: new Date('2025-01-14'),
        updatedAt: new Date('2025-01-14'),
        isSaved: false,
        aiResponse: {
          id: 'resp-2',
          validationStatus: 'PENDING',
          confidenceScore: 0.0,
          citations: [],
        },
      },
    ]);
    mockPrisma.question.groupBy.mockResolvedValue([
      { createdAt: new Date(), _count: { id: 3 } },
    ]);

    const result = await service.getUserDashboard('user-1');

    expect(result.totalQueries).toBe(25);
    expect(result.savedResponses).toBe(5);
    expect(result.aiResponsesGenerated).toBe(20);
    expect(result.topCategories).toBeDefined();
    expect(result.dailyTrends).toBeDefined();
    expect(result.activities).toBeDefined();
    expect(result.recentQueries).toBeDefined();
    expect(result.recentQueries.length).toBeGreaterThan(0);
  });

  it('should group categories correctly', async () => {
    mockPrisma.question.count.mockResolvedValueOnce(10);
    mockPrisma.question.count.mockResolvedValueOnce(0);
    mockPrisma.aIResponse.count.mockResolvedValue(10);
    mockPrisma.question.findMany.mockResolvedValue([
      {
        id: 'q-1',
        questionText: 'Q1',
        category: 'cardiology',
        createdAt: new Date(),
        updatedAt: new Date(),
        isSaved: false,
        aiResponse: { id: 'r1', validationStatus: 'APPROVED', confidenceScore: 0.9, citations: [] },
      },
      {
        id: 'q-2',
        questionText: 'Q2',
        category: 'cardiology',
        createdAt: new Date(),
        updatedAt: new Date(),
        isSaved: false,
        aiResponse: { id: 'r2', validationStatus: 'APPROVED', confidenceScore: 0.8, citations: [] },
      },
      {
        id: 'q-3',
        questionText: 'Q3',
        category: 'endocrinology',
        createdAt: new Date(),
        updatedAt: new Date(),
        isSaved: false,
        aiResponse: null,
      },
    ]);
    mockPrisma.question.groupBy.mockResolvedValue([]);

    const result = await service.getUserDashboard('user-1');

    const categoryNames = result.topCategories.map((c) => c.name);
    expect(categoryNames).toContain('cardiology');
    expect(categoryNames).toContain('endocrinology');
  });

  it('should return validation metrics', async () => {
    mockPrisma.validationReview.findMany.mockResolvedValue([
      { score: 5 },
      { score: 4 },
      { score: 3 },
    ]);

    const result = await service.getValidationMetrics();

    expect(result.totalReviews).toBe(3);
    expect(result.averageScore).toBeCloseTo(4, 1);
  });

  it('should return zero average score when no reviews', async () => {
    mockPrisma.validationReview.findMany.mockResolvedValue([]);

    const result = await service.getValidationMetrics();

    expect(result.totalReviews).toBe(0);
    expect(result.averageScore).toBe(0);
  });

  it('should handle null scores in validation metrics', async () => {
    mockPrisma.validationReview.findMany.mockResolvedValue([
      { score: 5 },
      { score: null },
      { score: 3 },
    ]);

    const result = await service.getValidationMetrics();

    expect(result.totalReviews).toBe(3);
    expect(result.averageScore).toBeCloseTo(4, 0);
  });
});
