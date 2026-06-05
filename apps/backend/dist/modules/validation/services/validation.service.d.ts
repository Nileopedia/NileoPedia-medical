export declare class ValidationService {
    getPending(): Promise<({
        question: {
            userId: string;
            id: string;
            createdAt: Date;
            questionText: string;
        };
    } & {
        questionId: string;
        summary: string;
        confidenceScore: number | null;
        keyFindings: string[];
        id: string;
        validationStatus: import("@prisma/client").$Enums.ValidationStatus;
        generatedBy: string;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    approve(responseId: string, validatorId: string, score: number, feedback: string): Promise<void>;
    reject(responseId: string, validatorId: string, feedback: string): Promise<void>;
    getHistory(validatorId: string): Promise<({
        aiResponse: {
            question: {
                userId: string;
                id: string;
                createdAt: Date;
                questionText: string;
            };
        } & {
            questionId: string;
            summary: string;
            confidenceScore: number | null;
            keyFindings: string[];
            id: string;
            validationStatus: import("@prisma/client").$Enums.ValidationStatus;
            generatedBy: string;
            createdAt: Date;
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
}
//# sourceMappingURL=validation.service.d.ts.map