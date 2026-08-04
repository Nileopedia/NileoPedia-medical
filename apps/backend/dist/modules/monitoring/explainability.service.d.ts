export interface Explanation {
    query: string;
    expandedQuery: string;
    resolvedAcronyms: string[];
    resolvedSynonyms: string[];
    retrievalSteps: Array<{
        step: string;
        description: string;
        timestamp: Date;
        duration: number;
    }>;
    documentSelectionReasons: Array<{
        documentId: string;
        title: string;
        reason: string;
        similarityScore: number;
        rerankerScore: number;
        citationQuality: number;
        metadataCompleteness: number;
        evidenceLevel: string;
        specialty: string;
        publicationYear?: number;
    }>;
    confidenceBreakdown: {
        similarityScore: number;
        documentCount: number;
        citationQuality: number;
        rerankerScore: number;
        metadataCompleteness: number;
        sourceAgreement: number;
    };
    hybridWeights: {
        dense: number;
        keyword: number;
    };
}
export declare class ExplainabilityService {
    generateExplanation(params: {
        query: string;
        expandedQuery: string;
        resolvedAcronyms: string[];
        resolvedSynonyms: string[];
        retrievalSteps: Explanation['retrievalSteps'];
        selectedDocuments: Array<{
            id: string;
            title: string;
            similarityScore: number;
            rerankerScore: number;
            citationQuality: number;
            metadataCompleteness: number;
            specialty: string;
            publicationYear?: number;
        }>;
        confidenceBreakdown: Explanation['confidenceBreakdown'];
        hybridWeights: Explanation['hybridWeights'];
    }): Explanation;
    private generateSelectionReason;
    private getEvidenceLevel;
    formatExplanationForUI(explanation: Explanation): string;
}
export declare const explainabilityService: ExplainabilityService;
//# sourceMappingURL=explainability.service.d.ts.map