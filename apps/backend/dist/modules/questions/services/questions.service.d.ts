export declare class QuestionsService {
    askQuestion(userId: string, questionText: string, specialty?: string): Promise<{
        questionId: string;
        status: string;
        message: string;
    }>;
    getHistory(userId: string): Promise<({
        aiResponse: ({
            citations: {
                id: string;
                createdAt: Date;
                source: string;
                publicationYear: number | null;
                specialty: string | null;
                title: string;
                documentType: string | null;
                aiResponseId: string;
                authors: string | null;
                doi: string | null;
                url: string | null;
                citationIndex: number;
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
            keyFindings: string[];
            confidenceScore: number | null;
            validationStatus: import("@prisma/client").$Enums.ValidationStatus;
            generatedBy: string;
        }) | null;
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        questionText: string;
        isSaved: boolean;
    })[]>;
    getQuestion(questionId: string): Promise<({
        aiResponse: ({
            citations: {
                id: string;
                createdAt: Date;
                source: string;
                publicationYear: number | null;
                specialty: string | null;
                title: string;
                documentType: string | null;
                aiResponseId: string;
                authors: string | null;
                doi: string | null;
                url: string | null;
                citationIndex: number;
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
            keyFindings: string[];
            confidenceScore: number | null;
            validationStatus: import("@prisma/client").$Enums.ValidationStatus;
            generatedBy: string;
        }) | null;
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        questionText: string;
        isSaved: boolean;
    }) | {
        aiResponse: {
            summary: string;
            keyFindings: never[];
            detailedExplanation: string;
            confidenceScore: number;
            generatedBy: string;
        };
        id: string;
        createdAt: Date;
        userId: string;
        questionText: string;
        isSaved: boolean;
    }>;
    saveResponse(questionId: string, userId: string): Promise<void>;
    unsaveResponse(questionId: string, userId: string): Promise<void>;
}
//# sourceMappingURL=questions.service.d.ts.map