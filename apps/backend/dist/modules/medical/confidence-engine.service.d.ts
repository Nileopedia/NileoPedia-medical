export declare enum EvidenceStrength {
    VERY_HIGH = "Very High",
    HIGH = "High",
    MODERATE = "Moderate",
    LOW = "Low",
    VERY_LOW = "Very Low"
}
export interface ConfidenceResult {
    confidenceScore: number;
    evidenceStrength: EvidenceStrength;
    retrievalQuality: number;
    breakdown: {
        similarityScore: number;
        documentCount: number;
        citationQuality: number;
        rerankerScore: number;
        metadataCompleteness: number;
        sourceAgreement: number;
    };
}
export declare class ConfidenceEngine {
    calculate(params: {
        topSimilarity: number;
        retrievedCount: number;
        rerankerScores: number[];
        citationQualityScores: number[];
        metadataCompleteness: number;
        sourceDiversity: number;
    }): ConfidenceResult;
    private getEvidenceStrength;
}
export declare const confidenceEngine: ConfidenceEngine;
//# sourceMappingURL=confidence-engine.service.d.ts.map