export declare class QuestionsService {
    askQuestion(userId: string, questionText: string): Promise<{
        questionId: string;
        status: string;
        message: string;
    }>;
    getHistory(userId: string): Promise<({
        aiResponse: ({
            citations: {
                specialty: string | null;
                id: string;
                createdAt: Date;
                aiResponseId: string;
                title: string;
                source: string;
                authors: string | null;
                publicationYear: number | null;
                doi: string | null;
                url: string | null;
                citationIndex: number;
                documentType: string | null;
                chunkId: string | null;
                pageNumber: number | null;
                sectionTitle: string | null;
            }[];
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
        }) | null;
    } & {
        userId: string;
        id: string;
        createdAt: Date;
        questionText: string;
    })[]>;
    getQuestion(questionId: string): Promise<{
        aiResponse: ({
            citations: {
                specialty: string | null;
                id: string;
                createdAt: Date;
                aiResponseId: string;
                title: string;
                source: string;
                authors: string | null;
                publicationYear: number | null;
                doi: string | null;
                url: string | null;
                citationIndex: number;
                documentType: string | null;
                chunkId: string | null;
                pageNumber: number | null;
                sectionTitle: string | null;
            }[];
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
        }) | null;
    } & {
        userId: string;
        id: string;
        createdAt: Date;
        questionText: string;
    }>;
    saveResponse(questionId: string, userId: string): Promise<void>;
    unsaveResponse(questionId: string, userId: string): Promise<void>;
}
//# sourceMappingURL=questions.service.d.ts.map