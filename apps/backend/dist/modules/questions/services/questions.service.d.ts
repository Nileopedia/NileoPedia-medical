export declare class QuestionsService {
    askQuestion(userId: string, questionText: string): Promise<{
        questionId: string;
        status: string;
        message: string;
    }>;
    getHistory(userId: string): Promise<({
        aiResponse: ({
            citations: {
                id: string;
                createdAt: Date;
                url: string | null;
                aiResponseId: string;
                title: string;
                source: string;
                authors: string | null;
                publicationYear: number | null;
                doi: string | null;
                citationIndex: number;
                documentType: string | null;
                specialty: string | null;
                chunkId: string | null;
                pageNumber: number | null;
                sectionTitle: string | null;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            questionId: string;
            summary: string;
            confidenceScore: number | null;
            validationStatus: import("@prisma/client").$Enums.ValidationStatus;
            generatedBy: string;
        }) | null;
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        questionText: string;
    })[]>;
    getQuestion(questionId: string): Promise<{
        aiResponse: ({
            citations: {
                id: string;
                createdAt: Date;
                url: string | null;
                aiResponseId: string;
                title: string;
                source: string;
                authors: string | null;
                publicationYear: number | null;
                doi: string | null;
                citationIndex: number;
                documentType: string | null;
                specialty: string | null;
                chunkId: string | null;
                pageNumber: number | null;
                sectionTitle: string | null;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            questionId: string;
            summary: string;
            confidenceScore: number | null;
            validationStatus: import("@prisma/client").$Enums.ValidationStatus;
            generatedBy: string;
        }) | null;
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        questionText: string;
    }>;
    saveResponse(questionId: string, userId: string): Promise<void>;
    unsaveResponse(questionId: string, userId: string): Promise<void>;
}
//# sourceMappingURL=questions.service.d.ts.map