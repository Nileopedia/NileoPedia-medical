"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productionMonitoringService = exports.ProductionMonitoringService = void 0;
class ProductionMonitoringService {
    constructor() {
        this.metrics = [];
        this.performanceHistory = [];
        this.maxHistorySize = 10000;
    }
    recordMetric(metric) {
        this.metrics.push(metric);
        if (this.metrics.length > this.maxHistorySize) {
            this.metrics = this.metrics.slice(-this.maxHistorySize);
        }
    }
    recordPerformance(metrics) {
        this.performanceHistory.push(metrics);
        if (this.performanceHistory.length > this.maxHistorySize) {
            this.performanceHistory = this.performanceHistory.slice(-this.maxHistorySize);
        }
    }
    getSystemMetrics(timeRangeMs = 3600000) {
        const cutoff = new Date(Date.now() - timeRangeMs);
        const recentMetrics = this.performanceHistory.filter(p => p.timestamp >= cutoff);
        if (recentMetrics.length === 0) {
            return {
                averageRetrievalTime: 0,
                averageRerankTime: 0,
                averageGroqTime: 0,
                averageEndToEndTime: 0,
                averageChunkCount: 0,
                averageContextSize: 0,
                averageRerankerScore: 0,
                averageConfidence: 0,
                failedRetrievals: 0,
                hallucinationRate: 0,
                noContextResponses: 0,
                totalQueries: 0,
            };
        }
        const total = recentMetrics.length;
        const successful = recentMetrics.filter(m => m.success);
        const failed = recentMetrics.filter(m => !m.success);
        const noContext = recentMetrics.filter(m => m.chunkCount === 0);
        return {
            averageRetrievalTime: successful.reduce((sum, m) => sum + m.retrievalTime, 0) / successful.length,
            averageRerankTime: successful.reduce((sum, m) => sum + m.rerankTime, 0) / successful.length,
            averageGroqTime: successful.reduce((sum, m) => sum + m.groqTime, 0) / successful.length,
            averageEndToEndTime: successful.reduce((sum, m) => sum + m.totalTime, 0) / successful.length,
            averageChunkCount: successful.reduce((sum, m) => sum + m.chunkCount, 0) / successful.length,
            averageContextSize: successful.reduce((sum, m) => sum + m.contextSize, 0) / successful.length,
            averageRerankerScore: successful.reduce((sum, m) => sum + m.rerankerScore, 0) / successful.length,
            averageConfidence: successful.reduce((sum, m) => sum + m.confidence, 0) / successful.length,
            failedRetrievals: failed.length,
            hallucinationRate: 0,
            noContextResponses: noContext.length,
            totalQueries: total,
        };
    }
    getMetricsByMetricName(metricName, timeRangeMs = 3600000) {
        const cutoff = new Date(Date.now() - timeRangeMs);
        return this.metrics.filter(m => m.metricName === metricName &&
            m.timestamp >= cutoff);
    }
    getPerformanceHistory(limit = 100) {
        return this.performanceHistory.slice(-limit);
    }
    async getDashboardData() {
        const systemMetrics = this.getSystemMetrics();
        const recentQueries = this.getPerformanceHistory(50);
        const diseaseCounts = new Map();
        const symptomCounts = new Map();
        const medicationCounts = new Map();
        const searchCounts = new Map();
        const failedSearches = [];
        for (const query of recentQueries) {
            const queryLower = query.query.toLowerCase();
            const diseaseTerms = ['hypertension', 'diabetes', 'asthma', 'copd', 'malaria', 'tuberculosis', 'hiv', 'heart failure', 'stroke', 'cancer', 'pneumonia', 'ckd'];
            const symptomTerms = ['pain', 'fever', 'cough', 'fatigue', 'nausea', 'headache', 'dizziness', 'rash', 'swelling'];
            const medicationTerms = ['aspirin', 'ibuprofen', 'metformin', 'lisinopril', 'atorvastatin', 'amoxicillin'];
            for (const term of diseaseTerms) {
                if (queryLower.includes(term)) {
                    diseaseCounts.set(term, (diseaseCounts.get(term) || 0) + 1);
                }
            }
            for (const term of symptomTerms) {
                if (queryLower.includes(term)) {
                    symptomCounts.set(term, (symptomCounts.get(term) || 0) + 1);
                }
            }
            for (const term of medicationTerms) {
                if (queryLower.includes(term)) {
                    medicationCounts.set(term, (medicationCounts.get(term) || 0) + 1);
                }
            }
            const shortQuery = query.query.substring(0, 50);
            searchCounts.set(shortQuery, (searchCounts.get(shortQuery) || 0) + 1);
            if (!query.success && query.error) {
                failedSearches.push({
                    query: query.query,
                    error: query.error,
                    timestamp: new Date(),
                });
            }
        }
        const topDiseases = Array.from(diseaseCounts.entries())
            .map(([disease, count]) => ({ disease, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
        const topSymptoms = Array.from(symptomCounts.entries())
            .map(([symptom, count]) => ({ symptom, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
        const topMedications = Array.from(medicationCounts.entries())
            .map(([medication, count]) => ({ medication, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
        const missingDiseases = Array.from(searchCounts.entries())
            .filter(([query]) => {
            const hasResults = recentQueries.some(q => q.query === query && q.success && q.chunkCount > 0);
            return !hasResults;
        })
            .map(([disease, count]) => ({ disease, searchCount: count }))
            .sort((a, b) => b.searchCount - a.searchCount)
            .slice(0, 10);
        return {
            systemMetrics,
            recentQueries,
            topDiseases,
            topSymptoms,
            topMedications,
            missingDiseases,
            failedSearches: failedSearches.slice(0, 20),
        };
    }
}
exports.ProductionMonitoringService = ProductionMonitoringService;
exports.productionMonitoringService = new ProductionMonitoringService();
//# sourceMappingURL=production-monitoring.service.js.map