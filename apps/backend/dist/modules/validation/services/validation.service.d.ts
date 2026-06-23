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
    getHistory(validatorId: string): Promise<({
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
        status: import("@prisma/client").$Enums.ValidationStatus;
        validatorId: string;
        score: number | null;
        reviewedAt: Date;
    })[]>;
    getReview(responseId: string): Promise<{
        feedback: string | null;
        id: string;
        aiResponseId: string;
        status: import("@prisma/client").$Enums.ValidationStatus;
        validatorId: string;
        score: number | null;
        reviewedAt: Date;
    } | null>;
}
//# sourceMappingURL=validation.service.d.ts.map