export declare class QuestionsService {
    askQuestion(userId: string, questionText: string, specialty?: string): Promise<{
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
            id: string;
            summary: string;
            keyFindings: string[];
            confidenceScore: number | null;
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
        isSaved: boolean;
    })[]>;
    getQuestion(questionId: string): Promise<({
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
            id: string;
            summary: string;
            keyFindings: string[];
            confidenceScore: number | null;
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
        isSaved: boolean;
    }) | {
        aiResponse: {
            summary: string;
            keyFindings: never[];
            detailedExplanation: string;
            confidenceScore: number;
            generatedBy: string;
        };
        userId: string;
        id: string;
        createdAt: Date;
        questionText: string;
        isSaved: boolean;
    }>;
    saveResponse(questionId: string, userId: string): Promise<void>;
    unsaveResponse(questionId: string, userId: string): Promise<void>;
}
//# sourceMappingURL=questions.service.d.ts.map