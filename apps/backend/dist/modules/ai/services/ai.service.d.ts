export interface Citation {
    title: string;
    source: string;
    authors?: string;
    publicationYear?: number;
    doi?: string;
    url?: string;
    pageNumber?: number;
    sectionTitle?: string;
}
export declare class AIService {
    private groq;
    constructor();
    generateResponse(question: string, chunks: Array<{
        text: string;
        metadata?: Record<string, any>;
    }>): Promise<{
        summary: string;
        citations: Citation[];
        confidenceScore: number;
    }>;
    private getMockResponse;
    private calculateConfidence;
}
//# sourceMappingURL=ai.service.d.ts.map