export declare class QuestionsService {
    private pineconeService;
    private embeddingService;
    private aiService;
    constructor();
    askQuestion(userId: string, questionText: string): Promise<{
        questionId: string;
        response: {
            summary: string;
            status: import("@prisma/client").$Enums.ValidationStatus;
            confidenceScore: number | null;
            citations: {
                id: string;
                createdAt: Date;
                url: string | null;
                source: string;
                publicationYear: number | null;
                title: string;
                authors: string | null;
                doi: string | null;
                citationIndex: number;
                aiResponseId: string;
            }[];
            timestamp: Date;
        };
    }>;
    getHistory(userId: string): Promise<({
        aiResponse: ({
            citations: {
                id: string;
                createdAt: Date;
                url: string | null;
                source: string;
                publicationYear: number | null;
                title: string;
                authors: string | null;
                doi: string | null;
                citationIndex: number;
                aiResponseId: string;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            summary: string;
            confidenceScore: number | null;
            validationStatus: import("@prisma/client").$Enums.ValidationStatus;
            generatedBy: string;
            questionId: string;
        }) | null;
    } & {
        id: string;
        userId: string;
        createdAt: Date;
        questionText: string;
    })[]>;
    getQuestion(questionId: string): Promise<{
        aiResponse: ({
            citations: {
                id: string;
                createdAt: Date;
                url: string | null;
                source: string;
                publicationYear: number | null;
                title: string;
                authors: string | null;
                doi: string | null;
                citationIndex: number;
                aiResponseId: string;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            summary: string;
            confidenceScore: number | null;
            validationStatus: import("@prisma/client").$Enums.ValidationStatus;
            generatedBy: string;
            questionId: string;
        }) | null;
    } & {
        id: string;
        userId: string;
        createdAt: Date;
        questionText: string;
    }>;
    saveResponse(questionId: string, userId: string): Promise<void>;
    unsaveResponse(questionId: string, userId: string): Promise<void>;
}
//# sourceMappingURL=questions.service.d.ts.map