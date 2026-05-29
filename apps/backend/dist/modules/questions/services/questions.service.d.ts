export declare class QuestionsService {
    askQuestion(userId: string, questionText: string): Promise<{
        questionId: string;
        status: string;
        message: string;
    }>;
    getHistory(userId: string): Promise<({
        aiResponse: ({
            citations: {
                url: string | null;
                title: string;
                specialty: string | null;
                documentType: string | null;
                source: string;
                publicationYear: number | null;
                id: string;
                createdAt: Date;
                aiResponseId: string;
                authors: string | null;
                doi: string | null;
                citationIndex: number;
                chunkId: string | null;
                pageNumber: number | null;
                sectionTitle: string | null;
            }[];
        } & {
            id: string;
            summary: string;
            confidenceScore: number | null;
            validationStatus: import("@prisma/client").$Enums.ValidationStatus;
            generatedBy: string;
            createdAt: Date;
            updatedAt: Date;
            questionId: string;
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
                url: string | null;
                title: string;
                specialty: string | null;
                documentType: string | null;
                source: string;
                publicationYear: number | null;
                id: string;
                createdAt: Date;
                aiResponseId: string;
                authors: string | null;
                doi: string | null;
                citationIndex: number;
                chunkId: string | null;
                pageNumber: number | null;
                sectionTitle: string | null;
            }[];
        } & {
            id: string;
            summary: string;
            confidenceScore: number | null;
            validationStatus: import("@prisma/client").$Enums.ValidationStatus;
            generatedBy: string;
            createdAt: Date;
            updatedAt: Date;
            questionId: string;
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