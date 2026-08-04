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
    private confidenceEngine;
    private citationQualityService;
    constructor();
    generateResponse(question: string, chunks: Array<{
        text: string;
        metadata?: Record<string, any>;
    }>): Promise<{
        summary: string;
        citations: Citation[];
        confidenceScore: number;
        evidenceStrength: import("../../medical/confidence-engine.service").EvidenceStrength;
        retrievalQuality: number;
        breakdown: {
            similarityScore: number;
            documentCount: number;
            citationQuality: number;
            rerankerScore: number;
            metadataCompleteness: number;
            sourceAgreement: number;
        };
    }>;
    private computeMetadataCompleteness;
}
//# sourceMappingURL=ai.service.d.ts.map