export declare class QuestionsService {
    askQuestion(userId: string, questionText: string, specialty?: string): Promise<{
        questionId: string;
        status: string;
        message: string;
    }>;
    getHistory(userId: string, options?: {
        page?: number;
        limit?: number;
        category?: string;
        startDate?: string;
        endDate?: string;
    }): Promise<{
        questions: ({
            aiResponse: ({
                citations: {
                    id: string;
                    createdAt: Date;
                    aiResponseId: string;
                    specialty: string | null;
                    title: string;
                    documentType: string | null;
                    source: string;
                    publicationYear: number | null;
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
                questionId: string;
                summary: string;
                detailedExplanation: string | null;
                keyFindings: string[];
                confidenceScore: number | null;
                validationStatus: import("@prisma/client").$Enums.ValidationStatus;
                generatedBy: string;
                processingTime: number | null;
                documentsUsed: number | null;
                updatedAt: Date;
            }) | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            questionText: string;
            category: string | null;
            isSaved: boolean;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getSavedResponses(userId: string, options?: {
        page?: number;
        limit?: number;
        search?: string;
    }): Promise<{
        questions: ({
            aiResponse: ({
                citations: {
                    id: string;
                    createdAt: Date;
                    aiResponseId: string;
                    specialty: string | null;
                    title: string;
                    documentType: string | null;
                    source: string;
                    publicationYear: number | null;
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
                questionId: string;
                summary: string;
                detailedExplanation: string | null;
                keyFindings: string[];
                confidenceScore: number | null;
                validationStatus: import("@prisma/client").$Enums.ValidationStatus;
                generatedBy: string;
                processingTime: number | null;
                documentsUsed: number | null;
                updatedAt: Date;
            }) | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            questionText: string;
            category: string | null;
            isSaved: boolean;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getQuestion(questionId: string): Promise<({
        aiResponse: ({
            citations: {
                id: string;
                createdAt: Date;
                aiResponseId: string;
                specialty: string | null;
                title: string;
                documentType: string | null;
                source: string;
                publicationYear: number | null;
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
            questionId: string;
            summary: string;
            detailedExplanation: string | null;
            keyFindings: string[];
            confidenceScore: number | null;
            validationStatus: import("@prisma/client").$Enums.ValidationStatus;
            generatedBy: string;
            processingTime: number | null;
            documentsUsed: number | null;
            updatedAt: Date;
        }) | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        questionText: string;
        category: string | null;
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
        updatedAt: Date;
        userId: string;
        questionText: string;
        category: string | null;
        isSaved: boolean;
    }>;
    saveResponse(questionId: string, userId: string): Promise<void>;
    unsaveResponse(questionId: string, userId: string): Promise<void>;
}
//# sourceMappingURL=questions.service.d.ts.map