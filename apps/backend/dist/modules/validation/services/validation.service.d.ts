export declare class ValidationService {
    getPending(): Promise<({
        question: {
            id: string;
            userId: string;
            questionText: string;
            isSaved: boolean;
            createdAt: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        questionId: string;
        summary: string;
        keyFindings: string[];
        confidenceScore: number | null;
        validationStatus: import("@prisma/client").$Enums.ValidationStatus;
        generatedBy: string;
        updatedAt: Date;
    })[]>;
    approve(responseId: string, validatorId: string, score: number, feedback: string): Promise<void>;
    reject(responseId: string, validatorId: string, feedback: string): Promise<void>;
    getHistory(validatorId: string, userRole?: string): Promise<({
        aiResponse: {
            question: {
                id: string;
                userId: string;
                questionText: string;
                isSaved: boolean;
                createdAt: Date;
            };
        } & {
            id: string;
            createdAt: Date;
            questionId: string;
            summary: string;
            keyFindings: string[];
            confidenceScore: number | null;
            validationStatus: import("@prisma/client").$Enums.ValidationStatus;
            generatedBy: string;
            updatedAt: Date;
        };
    } & {
        feedback: string | null;
        id: string;
        aiResponseId: string;
        validatorId: string;
        status: import("@prisma/client").$Enums.ValidationStatus;
        score: number | null;
        reviewedAt: Date;
    })[]>;
    getReview(responseId: string): Promise<{
        feedback: string | null;
        id: string;
        aiResponseId: string;
        validatorId: string;
        status: import("@prisma/client").$Enums.ValidationStatus;
        score: number | null;
        reviewedAt: Date;
    } | null>;
    getApproved(page?: number, limit?: number): Promise<{
        reviews: {
            id: string;
            question: string;
            response: string;
            validator: string;
            date: string;
            score: number | null;
        }[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getRejected(page?: number, limit?: number): Promise<{
        reviews: {
            id: string;
            question: string;
            reason: string;
            validator: string;
            date: string;
        }[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getFeedbackReports(page?: number, limit?: number): Promise<{
        reports: {
            id: string;
            question: string;
            userFeedback: string;
            rating: number;
            reportedIssue: string;
            date: string;
            severity: "medium";
            status: "open";
        }[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    updateFeedbackReport(reportId: string, severity: string, status: string): Promise<void>;
    getProfile(validatorId: string): Promise<{
        id: string;
        fullName: string;
        email: string;
        specialization: string | null;
        institution: string | null;
        reviewsCompleted: number;
        approvalRate: number;
        averageReviewTime: number;
    }>;
    updateProfile(validatorId: string, data: {
        specialization?: string;
        institution?: string;
    }): Promise<{
        id: string;
        fullName: string;
        email: string;
    }>;
    getSettings(validatorId: string): Promise<{
        reviewAlerts: boolean;
        feedbackAlerts: boolean;
        emailNotifications: boolean;
        autoSortByPriority: boolean;
        citationDisplay: string;
    }>;
    updateSettings(validatorId: string, settings: Record<string, any>): Promise<Record<string, any>>;
}
//# sourceMappingURL=validation.service.d.ts.map