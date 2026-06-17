export declare class QuestionsService {
    askQuestion(userId: string, questionText: string, specialty?: string): Promise<{
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
                specialty: string | null;
                aiResponseId: string;
                source: string;
                publicationYear: number | null;
                title: string;
                documentType: string | null;
                authors: string | null;
                doi: string | null;
                chunkId: string | null;
                pageNumber: number | null;
                sectionTitle: string | null;
                citationIndex: number;
            }[];
        } & {
            questionId: string;
            id: string;
            createdAt: Date;
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
                specialty: string | null;
                aiResponseId: string;
                source: string;
                publicationYear: number | null;
                title: string;
                documentType: string | null;
                authors: string | null;
                doi: string | null;
                chunkId: string | null;
                pageNumber: number | null;
                sectionTitle: string | null;
                citationIndex: number;
            }[];
        } & {
            questionId: string;
            id: string;
            createdAt: Date;
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