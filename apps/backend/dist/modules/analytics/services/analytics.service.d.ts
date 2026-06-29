export declare class AnalyticsService {
    getDashboard(): Promise<{
        totalUsers: number;
        totalQuestions: number;
        pendingResponses: number;
        approvedResponses: number;
    }>;
    getUserDashboard(userId: string): Promise<{
        totalQueries: number;
        savedResponses: number;
        aiResponsesGenerated: number;
        pendingResponses: number;
        approvedResponses: number;
        avgResponseTime: string;
        topCategories: {
            name: string;
            count: number;
        }[];
        dailyTrends: Record<string, number>;
        activities: {
            id: string;
            type: "query_submitted";
            title: string;
            description: string;
            status: "pending" | "approved" | "rejected";
            timestamp: string;
        }[];
        recentQueries: {
            id: string;
            question: string;
            category: string;
            status: string;
            createdAt: string;
            updatedAt: string;
            isSaved: boolean;
            confidenceScore: number | null;
            responseTime: number | null;
        }[];
    }>;
    getValidationMetrics(): Promise<{
        totalReviews: number;
        averageScore: number;
    }>;
}
//# sourceMappingURL=analytics.service.d.ts.map