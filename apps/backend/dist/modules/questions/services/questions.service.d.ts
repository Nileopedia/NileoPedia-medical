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
                title: string;
                specialty: string | null;
                documentType: string | null;
                source: string;
                publicationYear: number | null;
                createdAt: Date;
                url: string | null;
                authors: string | null;
                doi: string | null;
                citationIndex: number;
                chunkId: string | null;
                pageNumber: number | null;
                sectionTitle: string | null;
                aiResponseId: string;
            }[];
            timestamp: Date;
        };
    }>;
    getHistory(userId: string): Promise<({
        aiResponse: ({
            citations: {
                id: string;
                title: string;
                specialty: string | null;
                documentType: string | null;
                source: string;
                publicationYear: number | null;
                createdAt: Date;
                url: string | null;
                authors: string | null;
                doi: string | null;
                citationIndex: number;
                chunkId: string | null;
                pageNumber: number | null;
                sectionTitle: string | null;
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
        createdAt: Date;
        questionText: string;
        userId: string;
    })[]>;
    getQuestion(questionId: string): Promise<{
        aiResponse: ({
            citations: {
                id: string;
                title: string;
                specialty: string | null;
                documentType: string | null;
                source: string;
                publicationYear: number | null;
                createdAt: Date;
                url: string | null;
                authors: string | null;
                doi: string | null;
                citationIndex: number;
                chunkId: string | null;
                pageNumber: number | null;
                sectionTitle: string | null;
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
        createdAt: Date;
        questionText: string;
        userId: string;
    }>;
    saveResponse(questionId: string, userId: string): Promise<void>;
    unsaveResponse(questionId: string, userId: string): Promise<void>;
}
//# sourceMappingURL=questions.service.d.ts.map