export declare class ValidationService {
    getPending(): Promise<({
        question: {
            id: string;
            questionText: string;
            createdAt: Date;
            userId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        questionId: string;
        updatedAt: Date;
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
                questionText: string;
                createdAt: Date;
                userId: string;
            };
        } & {
            id: string;
            createdAt: Date;
            questionId: string;
            updatedAt: Date;
            summary: string;
            confidenceScore: number | null;
            validationStatus: import("@prisma/client").$Enums.ValidationStatus;
            generatedBy: string;
        };
    } & {
        status: import("@prisma/client").$Enums.ValidationStatus;
        feedback: string | null;
        id: string;
        aiResponseId: string;
        validatorId: string;
        score: number | null;
        reviewedAt: Date;
    })[]>;
    getReview(responseId: string): Promise<{
        status: import("@prisma/client").$Enums.ValidationStatus;
        feedback: string | null;
        id: string;
        aiResponseId: string;
        validatorId: string;
        score: number | null;
        reviewedAt: Date;
    } | null>;
}
//# sourceMappingURL=validation.service.d.ts.map