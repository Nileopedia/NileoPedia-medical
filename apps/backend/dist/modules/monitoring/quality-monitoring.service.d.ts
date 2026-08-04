/**
 * Continuous Quality Monitoring Dashboard
 *
 * Tracks production quality metrics:
 * - Knowledge Coverage
 * - Knowledge Gaps
 * - Retrieval Precision
 * - Context Recall
 * - Citation Quality
 * - Hallucination Rate
 * - Duplicate Chunk Rate
 * - Average Chunk Size
 * - Embedding Failures
 * - Queue Failures
 * - Upload Failures
 * - Top Failed Queries
 * - Most Common Diseases
 * - Most Accessed Documents
 * - Dead Documents
 * - Unused Documents
 * - Expired Documents
 * - Broken Citations
 * - Average Confidence
 * - Average Evidence Level
 * - Groq Token Usage
 * - Pinecone Usage
 * - Storage Growth
 * - Historical trends
 */
export interface QualityMetric {
    name: string;
    value: number | string;
    unit?: string;
    trend?: 'up' | 'down' | 'stable';
    threshold?: {
        warning: number;
        critical: number;
    };
    status: 'healthy' | 'warning' | 'critical';
    timestamp: Date;
}
export interface QualityDashboard {
    timestamp: Date;
    overallHealth: 'healthy' | 'warning' | 'critical';
    metrics: QualityMetric[];
    alerts: QualityAlert[];
    trends: QualityTrend[];
}
export interface QualityAlert {
    severity: 'info' | 'warning' | 'critical';
    message: string;
    metric: string;
    currentValue: number | string;
    threshold: number | string;
    timestamp: Date;
}
export interface QualityTrend {
    metric: string;
    values: Array<{
        timestamp: Date;
        value: number;
    }>;
    trend: 'improving' | 'degrading' | 'stable';
    changePercent: number;
}
export declare class QualityMonitoringService {
    private metrics;
    private alerts;
    private trends;
    private maxHistorySize;
    collectMetrics(): Promise<QualityMetric[]>;
    private collectKnowledgeCoverage;
    private collectKnowledgeGaps;
    private collectRetrievalPrecision;
    private collectContextRecall;
    private collectCitationQuality;
    private collectHallucinationRate;
    private collectDuplicateChunkRate;
    private collectAverageChunkSize;
    private collectEmbeddingFailures;
    private collectQueueFailures;
    private collectUploadFailures;
    private collectTopFailedQueries;
    private collectMostCommonDiseases;
    private collectMostAccessedDocuments;
    private collectDeadDocuments;
    private collectUnusedDocuments;
    private collectExpiredDocuments;
    private collectBrokenCitations;
    private collectAverageConfidence;
    private collectAverageEvidenceLevel;
    private collectGroqTokenUsage;
    private collectPineconeUsage;
    private collectStorageGrowth;
    private checkAlerts;
    private updateTrends;
    getDashboard(): QualityDashboard;
    getAlerts(): QualityAlert[];
    getTrends(metricName?: string): QualityTrend[];
}
export declare const qualityMonitoringService: QualityMonitoringService;
//# sourceMappingURL=quality-monitoring.service.d.ts.map