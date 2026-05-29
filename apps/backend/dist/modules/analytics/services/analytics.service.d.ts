export declare class AnalyticsService {
    getDashboard(): Promise<{
        totalUsers: number;
        totalQuestions: number;
        pendingResponses: number;
        approvedResponses: number;
    }>;
    getValidationMetrics(): Promise<{
        totalReviews: number;
        averageScore: number;
    }>;
}
//# sourceMappingURL=analytics.service.d.ts.map