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
                id: string;
                createdAt: Date;
                aiResponseId: string;
                title: string;
                source: string;
                authors: string | null;
                publicationYear: number | null;
                doi: string | null;
                documentType: string | null;
                specialty: string | null;
                chunkId: string | null;
                pageNumber: number | null;
                sectionTitle: string | null;
                citationIndex: number;
            }[];
        } & {
            id: string;
            createdAt: Date;
            questionId: string;
            updatedAt: Date;
            summary: string;
            keyFindings: string[];
            confidenceScore: number | null;
            validationStatus: import("@prisma/client").$Enums.ValidationStatus;
            generatedBy: string;
        }) | null;
    } & {
        id: string;
        userId: string;
        questionText: string;
        isSaved: boolean;
        createdAt: Date;
    })[]>;
    getQuestion(questionId: string): Promise<{
        aiResponse: ({
            citations: {
                url: string | null;
                id: string;
                createdAt: Date;
                aiResponseId: string;
                title: string;
                source: string;
                authors: string | null;
                publicationYear: number | null;
                doi: string | null;
                documentType: string | null;
                specialty: string | null;
                chunkId: string | null;
                pageNumber: number | null;
                sectionTitle: string | null;
                citationIndex: number;
            }[];
        } & {
            id: string;
            createdAt: Date;
            questionId: string;
            updatedAt: Date;
            summary: string;
            keyFindings: string[];
            confidenceScore: number | null;
            validationStatus: import("@prisma/client").$Enums.ValidationStatus;
            generatedBy: string;
        }) | null;
    } & {
        id: string;
        userId: string;
        questionText: string;
        isSaved: boolean;
        createdAt: Date;
    }>;
    saveResponse(questionId: string, userId: string): Promise<void>;
    unsaveResponse(questionId: string, userId: string): Promise<void>;
}
//# sourceMappingURL=questions.service.d.ts.map