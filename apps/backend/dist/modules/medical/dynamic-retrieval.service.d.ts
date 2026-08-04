export interface QueryAnalysis {
    queryType: 'abbreviation' | 'keyword' | 'natural_language' | 'symptom' | 'question';
    denseWeight: number;
    keywordWeight: number;
    expandedTerms: string[];
    detectedAcronyms: string[];
    detectedSynonyms: string[];
    medicalConcepts: string[];
    complexity: 'low' | 'medium' | 'high';
}
export declare class DynamicRetrievalService {
    private synonymService;
    private acronymResolver;
    constructor();
    analyzeQuery(query: string): QueryAnalysis;
    private extractMedicalTerms;
}
export declare const dynamicRetrievalService: DynamicRetrievalService;
//# sourceMappingURL=dynamic-retrieval.service.d.ts.map