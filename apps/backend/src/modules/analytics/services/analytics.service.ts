import prisma from '../../../config/prisma';

export class AnalyticsService {
  async getDashboard() {
    const [totalUsers, totalQuestions, pendingResponses, approvedResponses] = await Promise.all([
      prisma.user.count(),
      prisma.question.count(),
      prisma.aIResponse.count({ where: { validationStatus: 'PENDING' } }),
      prisma.aIResponse.count({ where: { validationStatus: 'APPROVED' } }),
    ]);

    return {
      totalUsers,
      totalQuestions,
      pendingResponses,
      approvedResponses,
    };
  }

  async getValidationMetrics() {
    const reviews = await prisma.validationReview.findMany({
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