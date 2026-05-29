export declare class ValidationService {
    getPending(): Promise<({
        question: {
            id: string;
            createdAt: Date;
            questionText: string;
            userId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        summary: string;
        confidenceScore: number | null;
        validationStatus: import("@prisma/client").$Enums.ValidationStatus;
        generatedBy: string;
        questionId: string;
    })[]>;
    approve(responseId: string, validatorId: string, score: number, feedback: string): Promise<void>;
    reject(responseId: string, validatorId: string, feedback: string): Promise<void>;
    getHistory(validatorId: string): Promise<({
        aiResponse: {
            question: {
                id: string;
                createdAt: Date;
                questionText: string;
                userId: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            summary: string;
            confidenceScore: number | null;
            validationStatus: import("@prisma/client").$Enums.ValidationStatus;
            generatedBy: string;
            questionId: string;
        };
    } & {
        id: string;
        feedback: string | null;
        status: import("@prisma/client").$Enums.ValidationStatus;
        aiResponseId: string;
        validatorId: string;
        score: number | null;
        reviewedAt: Date;
    })[]>;
    getReview(responseId: string): Promise<{
        id: string;
        feedback: string | null;
        status: import("@prisma/client").$Enums.ValidationStatus;
        aiResponseId: string;
        validatorId: string;
        score: number | null;
        reviewedAt: Date;
    } | null>;
}
//# sourceMappingURL=validation.service.d.ts.map