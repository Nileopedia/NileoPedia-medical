export declare class AIService {
    private openai;
    constructor();
    generateResponse(question: string, documents: string[]): Promise<{
        summary: string;
        citations: {
            title: string;
            source: string;
            year: number;
            authors: string;
        }[];
        confidenceScore: number;
    }>;
}
//# sourceMappingURL=ai.service.d.ts.map