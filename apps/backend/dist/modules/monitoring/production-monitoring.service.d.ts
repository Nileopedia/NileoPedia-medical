export interface MonitoringMetric {
    timestamp: Date;
    metricName: string;
    value: number;
    unit: string;
    tags: Record<string, string>;
}
export interface PerformanceMetrics {
    timestamp: Date;
    retrievalTime: number;
    rerankTime: number;
    groqTime: number;
    totalTime: number;
    chunkCount: number;
    contextSize: number;
    rerankerScore: number;
    confidence: number;
    query: string;
    success: boolean;
    error?: string;
}
export interface SystemMetrics {
    averageRetrievalTime: number;
    averageRerankTime: number;
    averageGroqTime: number;
    averageEndToEndTime: number;
    averageChunkCount: number;
    averageContextSize: number;
    averageRerankerScore: number;
    averageConfidence: number;
    failedRetrievals: number;
    hallucinationRate: number;
    noContextResponses: number;
    totalQueries: number;
}
export declare class ProductionMonitoringService {
    private metrics;
    private performanceHistory;
    private maxHistorySize;
    recordMetric(metric: MonitoringMetric): void;
    recordPerformance(metrics: PerformanceMetrics): void;
    getSystemMetrics(timeRangeMs?: number): SystemMetrics;
    getMetricsByMetricName(metricName: string, timeRangeMs?: number): MonitoringMetric[];
    getPerformanceHistory(limit?: number): PerformanceMetrics[];
    getDashboardData(): Promise<{
        systemMetrics: SystemMetrics;
        recentQueries: PerformanceMetrics[];
        topDiseases: Array<{
            disease: string;
            count: number;
        }>;
        topSymptoms: Array<{
            symptom: string;
            count: number;
        }>;
        topMedications: Array<{
            medication: string;
            count: number;
        }>;
        missingDiseases: Array<{
            disease: string;
            searchCount: number;
        }>;
        failedSearches: Array<{
            query: string;
            error: string;
            timestamp: Date;
        }>;
    }>;
}
export declare const productionMonitoringService: ProductionMonitoringService;
//# sourceMappingURL=production-monitoring.service.d.ts.map