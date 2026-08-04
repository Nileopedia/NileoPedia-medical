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
                    institution: string | null;
                    createdAt: Date;
                    title: string;
                    specialty: string | null;
                    documentType: string | null;
                    source: string;
                    publicationYear: number | null;
                    url: string | null;
                    chunkId: string | null;
                    aiResponseId: string;
                    authors: string | null;
                    journal: string | null;
                    publisher: string | null;
                    volume: string | null;
                    issue: string | null;
                    pages: string | null;
                    doi: string | null;
                    isbn: string | null;
                    pmid: string | null;
                    pmcid: string | null;
                    country: string | null;
                    publicationType: string | null;
                    keywords: string[];
                    medicalSpecialty: string | null;
                    language: string | null;
                    citationIndex: number;
                    pageNumber: number | null;
                    sectionTitle: string | null;
                }[];
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                questionId: string;
                summary: string;
                detailedExplanation: string | null;
                keyFindings: string[];
                confidenceScore: number | null;
                validationStatus: import("@prisma/client").$Enums.ValidationStatus;
                responseType: import("@prisma/client").$Enums.AIResponseStatus;
                reason: string | null;
                generatedBy: string;
                processingTime: number | null;
                documentsUsed: number | null;
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
                    institution: string | null;
                    createdAt: Date;
                    title: string;
                    specialty: string | null;
                    documentType: string | null;
                    source: string;
                    publicationYear: number | null;
                    url: string | null;
                    chunkId: string | null;
                    aiResponseId: string;
                    authors: string | null;
                    journal: string | null;
                    publisher: string | null;
                    volume: string | null;
                    issue: string | null;
                    pages: string | null;
                    doi: string | null;
                    isbn: string | null;
                    pmid: string | null;
                    pmcid: string | null;
                    country: string | null;
                    publicationType: string | null;
                    keywords: string[];
                    medicalSpecialty: string | null;
                    language: string | null;
                    citationIndex: number;
                    pageNumber: number | null;
                    sectionTitle: string | null;
                }[];
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                questionId: string;
                summary: string;
                detailedExplanation: string | null;
                keyFindings: string[];
                confidenceScore: number | null;
                validationStatus: import("@prisma/client").$Enums.ValidationStatus;
                responseType: import("@prisma/client").$Enums.AIResponseStatus;
                reason: string | null;
                generatedBy: string;
                processingTime: number | null;
                documentsUsed: number | null;
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
    getQuestion(questionId: string): Promise<{
        aiResponse: ({
            citations: {
                id: string;
                institution: string | null;
                createdAt: Date;
                title: string;
                specialty: string | null;
                documentType: string | null;
                source: string;
                publicationYear: number | null;
                url: string | null;
                chunkId: string | null;
                aiResponseId: string;
                authors: string | null;
                journal: string | null;
                publisher: string | null;
                volume: string | null;
                issue: string | null;
                pages: string | null;
                doi: string | null;
                isbn: string | null;
                pmid: string | null;
                pmcid: string | null;
                country: string | null;
                publicationType: string | null;
                keywords: string[];
                medicalSpecialty: string | null;
                language: string | null;
                citationIndex: number;
                pageNumber: number | null;
                sectionTitle: string | null;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            questionId: string;
            summary: string;
            detailedExplanation: string | null;
            keyFindings: string[];
            confidenceScore: number | null;
            validationStatus: import("@prisma/client").$Enums.ValidationStatus;
            responseType: import("@prisma/client").$Enums.AIResponseStatus;
            reason: string | null;
            generatedBy: string;
            processingTime: number | null;
            documentsUsed: number | null;
        }) | null;
    } & {
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