export interface KnowledgeGapAlert {
    id: string;
    query: string;
    searchCount: number;
    lastSearched: Date;
    suggestedDocuments: string[];
    priority: 'high' | 'medium' | 'low';
    status: 'new' | 'acknowledged' | 'resolved';
}
export interface KnowledgeGapReport {
    totalGaps: number;
    highPriorityGaps: number;
    mediumPriorityGaps: number;
    lowPriorityGaps: number;
    gaps: KnowledgeGapAlert[];
    recommendations: string[];
}
export declare class KnowledgeGapDetectionService {
    private queryHistory;
    private maxHistorySize;
    recordSearch(query: string, hasResults: boolean): void;
    detectGaps(): Promise<KnowledgeGapReport>;
    private suggestDocuments;
    getQueryHistory(): Array<{
        query: string;
        count: number;
        lastSearched: Date;
        hasResults: boolean;
    }>;
}
export declare const knowledgeGapDetectionService: KnowledgeGapDetectionService;
//# sourceMappingURL=knowledge-gap-detection.service.d.ts.map