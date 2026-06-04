export declare class ValidationService {
    getPending(): Promise<({
        question: {
            id: string;
            createdAt: Date;
            userId: string;
            questionText: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        questionId: string;
        summary: string;
        confidenceScore: number | null;
        validationStatus: import("@prisma/client").$Enums.ValidationStatus;
        generatedBy: string;
    })[]>;
    approve(responseId: string, validatorId: string, score: number, feedback: string): Promise<void>;
    reject(responseId: string, validatorId: string, feedback: string): Promise<void>;
    getHistory(validatorId: string): Promise<({
        aiResponse: {
            question: {
                id: string;
                createdAt: Date;
                userId: string;
                questionText: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            questionId: string;
            summary: string;
            confidenceScore: number | null;
            validationStatus: import("@prisma/client").$Enums.ValidationStatus;
            generatedBy: string;
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
}
//# sourceMappingURL=validation.service.d.ts.map