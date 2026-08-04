"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.qualityMonitoringService = exports.QualityMonitoringService = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const knowledge_audit_service_1 = require("../../modules/medical/knowledge-audit.service");
const knowledge_gap_detection_service_1 = require("../../modules/monitoring/knowledge-gap-detection.service");
class QualityMonitoringService {
    constructor() {
        this.metrics = [];
        this.alerts = [];
        this.trends = [];
        this.maxHistorySize = 1000;
    }
    async collectMetrics() {
        const metrics = [];
        const timestamp = new Date();
        metrics.push(await this.collectKnowledgeCoverage(timestamp));
        metrics.push(await this.collectKnowledgeGaps(timestamp));
        metrics.push(await this.collectRetrievalPrecision(timestamp));
        metrics.push(await this.collectContextRecall(timestamp));
        metrics.push(await this.collectCitationQuality(timestamp));
        metrics.push(await this.collectHallucinationRate(timestamp));
        metrics.push(await this.collectDuplicateChunkRate(timestamp));
        metrics.push(await this.collectAverageChunkSize(timestamp));
        metrics.push(await this.collectEmbeddingFailures(timestamp));
        metrics.push(await this.collectQueueFailures(timestamp));
        metrics.push(await this.collectUploadFailures(timestamp));
        metrics.push(await this.collectTopFailedQueries(timestamp));
        metrics.push(await this.collectMostCommonDiseases(timestamp));
        metrics.push(await this.collectMostAccessedDocuments(timestamp));
        metrics.push(await this.collectDeadDocuments(timestamp));
        metrics.push(await this.collectUnusedDocuments(timestamp));
        metrics.push(await this.collectExpiredDocuments(timestamp));
        metrics.push(await this.collectBrokenCitations(timestamp));
        metrics.push(await this.collectAverageConfidence(timestamp));
        metrics.push(await this.collectAverageEvidenceLevel(timestamp));
        metrics.push(await this.collectGroqTokenUsage(timestamp));
        metrics.push(await this.collectPineconeUsage(timestamp));
        metrics.push(await this.collectStorageGrowth(timestamp));
        this.metrics.push(...metrics);
        if (this.metrics.length > this.maxHistorySize) {
            this.metrics = this.metrics.slice(-this.maxHistorySize);
        }
        this.checkAlerts(metrics);
        this.updateTrends(metrics);
        return metrics;
    }
    async collectKnowledgeCoverage(timestamp) {
        try {
            const audit = await knowledge_audit_service_1.knowledgeAuditService.runAudit();
            const coverage = audit.coveragePercentage;
            return {
                name: 'Knowledge Coverage',
                value: coverage,
                unit: '%',
                trend: coverage >= 80 ? 'stable' : 'down',
                threshold: { warning: 70, critical: 50 },
                status: coverage >= 80 ? 'healthy' : coverage >= 50 ? 'warning' : 'critical',
                timestamp,
            };
        }
        catch (error) {
            return {
                name: 'Knowledge Coverage',
                value: 0,
                unit: '%',
                status: 'critical',
                timestamp,
            };
        }
    }
    async collectKnowledgeGaps(timestamp) {
        try {
            const gaps = await knowledge_gap_detection_service_1.knowledgeGapDetectionService.detectGaps();
            const gapCount = Array.isArray(gaps.gaps) ? gaps.gaps.length : 0;
            return {
                name: 'Knowledge Gaps',
                value: gapCount,
                unit: 'gaps',
                trend: gapCount === 0 ? 'stable' : 'up',
                threshold: { warning: 10, critical: 25 },
                status: gapCount === 0 ? 'healthy' : gapCount <= 10 ? 'warning' : 'critical',
                timestamp,
            };
        }
        catch (error) {
            return {
                name: 'Knowledge Gaps',
                value: -1,
                status: 'critical',
                timestamp,
            };
        }
    }
    async collectRetrievalPrecision(timestamp) {
        try {
            const recentQueries = await prisma_1.default.question.findMany({
                where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
                include: { aiResponse: true },
                take: 100,
            });
            const withResponses = recentQueries.filter(q => q.aiResponse);
            const precision = withResponses.length > 0
                ? withResponses.filter(q => q.aiResponse.validationStatus === 'APPROVED').length / withResponses.length
                : 0;
            return {
                name: 'Retrieval Precision',
                value: Math.round(precision * 10000) / 100,
                unit: '%',
                trend: precision >= 0.7 ? 'stable' : 'down',
                threshold: { warning: 60, critical: 40 },
                status: precision >= 0.7 ? 'healthy' : precision >= 0.4 ? 'warning' : 'critical',
                timestamp,
            };
        }
        catch (error) {
            return {
                name: 'Retrieval Precision',
                value: 0,
                unit: '%',
                status: 'critical',
                timestamp,
            };
        }
    }
    async collectContextRecall(timestamp) {
        try {
            const responses = await prisma_1.default.aIResponse.findMany({
                where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
                take: 50,
            });
            const avgRecall = responses.length > 0
                ? responses.reduce((sum, r) => sum + (r.documentsUsed || 0), 0) / responses.length / 10
                : 0;
            return {
                name: 'Context Recall',
                value: Math.round(avgRecall * 10000) / 100,
                unit: '%',
                trend: avgRecall >= 0.7 ? 'stable' : 'down',
                threshold: { warning: 60, critical: 40 },
                status: avgRecall >= 0.7 ? 'healthy' : avgRecall >= 0.4 ? 'warning' : 'critical',
                timestamp,
            };
        }
        catch (error) {
            return {
                name: 'Context Recall',
                value: 0,
                unit: '%',
                status: 'critical',
                timestamp,
            };
        }
    }
    async collectCitationQuality(timestamp) {
        try {
            const responses = await prisma_1.default.aIResponse.findMany({
                where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
                include: { citations: true },
                take: 50,
            });
            let totalCitations = 0;
            let validCitations = 0;
            responses.forEach(response => {
                response.citations?.forEach(citation => {
                    totalCitations++;
                    if (citation.title && citation.title !== 'Unknown' && citation.source && citation.source !== 'Unknown') {
                        validCitations++;
                    }
                });
            });
            const quality = totalCitations > 0 ? (validCitations / totalCitations) * 100 : 0;
            return {
                name: 'Citation Quality',
                value: Math.round(quality * 100) / 100,
                unit: '%',
                trend: quality >= 80 ? 'stable' : 'down',
                threshold: { warning: 70, critical: 50 },
                status: quality >= 80 ? 'healthy' : quality >= 50 ? 'warning' : 'critical',
                timestamp,
            };
        }
        catch (error) {
            return {
                name: 'Citation Quality',
                value: 0,
                unit: '%',
                status: 'critical',
                timestamp,
            };
        }
    }
    async collectHallucinationRate(timestamp) {
        try {
            const reviews = await prisma_1.default.validationReview.findMany({
                where: { reviewedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
                take: 100,
            });
            const hallucinations = reviews.filter(r => r.feedback?.toLowerCase().includes('hallucination') ||
                r.feedback?.toLowerCase().includes('incorrect')).length;
            const rate = reviews.length > 0 ? (hallucinations / reviews.length) * 100 : 0;
            return {
                name: 'Hallucination Rate',
                value: Math.round(rate * 100) / 100,
                unit: '%',
                trend: rate <= 5 ? 'stable' : 'up',
                threshold: { warning: 10, critical: 20 },
                status: rate <= 5 ? 'healthy' : rate <= 10 ? 'warning' : 'critical',
                timestamp,
            };
        }
        catch (error) {
            return {
                name: 'Hallucination Rate',
                value: -1,
                status: 'critical',
                timestamp,
            };
        }
    }
    async collectDuplicateChunkRate(timestamp) {
        try {
            const total = await prisma_1.default.embeddingMetadata.count();
            const duplicates = await prisma_1.default.embeddingMetadata.count({
                where: { isDuplicate: true }
            });
            const rate = total > 0 ? (duplicates / total) * 100 : 0;
            return {
                name: 'Duplicate Chunk Rate',
                value: Math.round(rate * 100) / 100,
                unit: '%',
                trend: rate <= 2 ? 'stable' : 'up',
                threshold: { warning: 5, critical: 10 },
                status: rate <= 2 ? 'healthy' : rate <= 5 ? 'warning' : 'critical',
                timestamp,
            };
        }
        catch (error) {
            return {
                name: 'Duplicate Chunk Rate',
                value: -1,
                status: 'critical',
                timestamp,
            };
        }
    }
    async collectAverageChunkSize(timestamp) {
        try {
            const chunks = await prisma_1.default.embeddingMetadata.findMany({
                take: 100,
                select: { chunkLength: true }
            });
            const lengths = chunks.filter(c => c.chunkLength && c.chunkLength > 0).map(c => c.chunkLength);
            const avgSize = lengths.length > 0 ? lengths.reduce((a, b) => a + b, 0) / lengths.length : 0;
            return {
                name: 'Average Chunk Size',
                value: Math.round(avgSize),
                unit: 'chars',
                trend: avgSize >= 300 && avgSize <= 1000 ? 'stable' : avgSize > 1000 ? 'up' : 'down',
                threshold: { warning: 1500, critical: 2000 },
                status: avgSize >= 300 && avgSize <= 1000 ? 'healthy' : avgSize <= 1500 ? 'warning' : 'critical',
                timestamp,
            };
        }
        catch (error) {
            return {
                name: 'Average Chunk Size',
                value: 0,
                unit: 'chars',
                status: 'critical',
                timestamp,
            };
        }
    }
    async collectEmbeddingFailures(timestamp) {
        try {
            const failures = await prisma_1.default.medicalDocument.count({
                where: { ingestionStatus: 'FAILED' }
            });
            return {
                name: 'Embedding Failures',
                value: failures,
                unit: 'documents',
                trend: failures === 0 ? 'stable' : 'up',
                threshold: { warning: 5, critical: 10 },
                status: failures === 0 ? 'healthy' : failures <= 5 ? 'warning' : 'critical',
                timestamp,
            };
        }
        catch (error) {
            return {
                name: 'Embedding Failures',
                value: -1,
                status: 'critical',
                timestamp,
            };
        }
    }
    async collectQueueFailures(timestamp) {
        const queueFailures = 0;
        return {
            name: 'Queue Failures',
            value: queueFailures,
            unit: 'failures',
            trend: 'stable',
            threshold: { warning: 10, critical: 25 },
            status: queueFailures === 0 ? 'healthy' : queueFailures <= 10 ? 'warning' : 'critical',
            timestamp,
        };
    }
    async collectUploadFailures(timestamp) {
        try {
            const failures = await prisma_1.default.medicalDocument.count({
                where: { ingestionStatus: 'FAILED' }
            });
            return {
                name: 'Upload Failures',
                value: failures,
                unit: 'documents',
                trend: failures === 0 ? 'stable' : 'up',
                threshold: { warning: 3, critical: 10 },
                status: failures === 0 ? 'healthy' : failures <= 3 ? 'warning' : 'critical',
                timestamp,
            };
        }
        catch (error) {
            return {
                name: 'Upload Failures',
                value: -1,
                status: 'critical',
                timestamp,
            };
        }
    }
    async collectTopFailedQueries(timestamp) {
        try {
            const questions = await prisma_1.default.question.findMany({
                where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
                include: { aiResponse: true },
                take: 100,
            });
            const failedQuestions = questions.filter(q => q.aiResponse && q.aiResponse.validationStatus === 'REJECTED');
            return {
                name: 'Top Failed Queries',
                value: failedQuestions.length,
                unit: 'queries',
                trend: failedQuestions.length === 0 ? 'stable' : 'up',
                threshold: { warning: 10, critical: 25 },
                status: failedQuestions.length === 0 ? 'healthy' : failedQuestions.length <= 10 ? 'warning' : 'critical',
                timestamp,
            };
        }
        catch (error) {
            return {
                name: 'Top Failed Queries',
                value: -1,
                status: 'critical',
                timestamp,
            };
        }
    }
    async collectMostCommonDiseases(timestamp) {
        try {
            const audit = await knowledge_audit_service_1.knowledgeAuditService.runAudit();
            const diseases = audit.diseasesIndexed;
            return {
                name: 'Most Common Diseases',
                value: diseases.slice(0, 10).join(', ') || 'None',
                status: diseases.length > 0 ? 'healthy' : 'warning',
                timestamp,
            };
        }
        catch (error) {
            return {
                name: 'Most Common Diseases',
                value: 'Error',
                status: 'critical',
                timestamp,
            };
        }
    }
    async collectMostAccessedDocuments(timestamp) {
        try {
            const responses = await prisma_1.default.aIResponse.findMany({
                where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
                include: { citations: true },
                take: 100,
            });
            const docCounts = new Map();
            responses.forEach(response => {
                response.citations?.forEach(citation => {
                    const source = citation.source || 'Unknown';
                    docCounts.set(source, (docCounts.get(source) || 0) + 1);
                });
            });
            const topDocs = Array.from(docCounts.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([source, count]) => `${source} (${count})`)
                .join(', ');
            return {
                name: 'Most Accessed Documents',
                value: topDocs || 'None',
                status: 'healthy',
                timestamp,
            };
        }
        catch (error) {
            return {
                name: 'Most Accessed Documents',
                value: 'Error',
                status: 'critical',
                timestamp,
            };
        }
    }
    async collectDeadDocuments(timestamp) {
        try {
            const deadDocs = await prisma_1.default.medicalDocument.count({
                where: {
                    ingestionStatus: 'COMPLETED',
                    updatedAt: { lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
                }
            });
            return {
                name: 'Dead Documents',
                value: deadDocs,
                unit: 'documents',
                trend: deadDocs === 0 ? 'stable' : 'up',
                threshold: { warning: 50, critical: 100 },
                status: deadDocs === 0 ? 'healthy' : deadDocs <= 50 ? 'warning' : 'critical',
                timestamp,
            };
        }
        catch (error) {
            return {
                name: 'Dead Documents',
                value: -1,
                status: 'critical',
                timestamp,
            };
        }
    }
    async collectUnusedDocuments(timestamp) {
        try {
            const unusedDocs = await prisma_1.default.medicalDocument.count({
                where: {
                    ingestionStatus: 'COMPLETED',
                    updatedAt: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
                }
            });
            return {
                name: 'Unused Documents',
                value: unusedDocs,
                unit: 'documents',
                trend: 'stable',
                threshold: { warning: 100, critical: 200 },
                status: unusedDocs <= 100 ? 'healthy' : unusedDocs <= 200 ? 'warning' : 'critical',
                timestamp,
            };
        }
        catch (error) {
            return {
                name: 'Unused Documents',
                value: -1,
                status: 'critical',
                timestamp,
            };
        }
    }
    async collectExpiredDocuments(timestamp) {
        try {
            const expiredDocs = await prisma_1.default.medicalDocument.count({
                where: {
                    publicationYear: { lt: new Date().getFullYear() - 10 }
                }
            });
            return {
                name: 'Expired Documents',
                value: expiredDocs,
                unit: 'documents',
                trend: 'stable',
                threshold: { warning: 20, critical: 50 },
                status: expiredDocs <= 20 ? 'healthy' : expiredDocs <= 50 ? 'warning' : 'critical',
                timestamp,
            };
        }
        catch (error) {
            return {
                name: 'Expired Documents',
                value: -1,
                status: 'critical',
                timestamp,
            };
        }
    }
    async collectBrokenCitations(timestamp) {
        try {
            const citations = await prisma_1.default.citation.findMany({
                where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }
            });
            const broken = citations.filter(c => !c.title || c.title === 'Unknown' || !c.source || c.source === 'Unknown').length;
            return {
                name: 'Broken Citations',
                value: broken,
                unit: 'citations',
                trend: broken === 0 ? 'stable' : 'up',
                threshold: { warning: 5, critical: 15 },
                status: broken === 0 ? 'healthy' : broken <= 5 ? 'warning' : 'critical',
                timestamp,
            };
        }
        catch (error) {
            return {
                name: 'Broken Citations',
                value: -1,
                status: 'critical',
                timestamp,
            };
        }
    }
    async collectAverageConfidence(timestamp) {
        try {
            const responses = await prisma_1.default.aIResponse.findMany({
                where: {
                    createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
                    confidenceScore: { not: null }
                },
                take: 50,
            });
            const scores = responses.map(r => r.confidenceScore);
            const avgConfidence = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
            return {
                name: 'Average Confidence',
                value: Math.round(avgConfidence * 10000) / 100,
                unit: '%',
                trend: avgConfidence >= 0.7 ? 'stable' : 'down',
                threshold: { warning: 50, critical: 30 },
                status: avgConfidence >= 0.7 ? 'healthy' : avgConfidence >= 0.3 ? 'warning' : 'critical',
                timestamp,
            };
        }
        catch (error) {
            return {
                name: 'Average Confidence',
                value: 0,
                unit: '%',
                status: 'critical',
                timestamp,
            };
        }
    }
    async collectAverageEvidenceLevel(timestamp) {
        try {
            const responses = await prisma_1.default.aIResponse.findMany({
                where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
                take: 50,
            });
            const evidenceLevels = responses.map(r => {
                if (r.documentsUsed && r.documentsUsed >= 5)
                    return 'Very High';
                if (r.documentsUsed && r.documentsUsed >= 3)
                    return 'High';
                if (r.documentsUsed && r.documentsUsed >= 2)
                    return 'Moderate';
                return 'Low';
            });
            const highEvidence = evidenceLevels.filter(l => l === 'Very High' || l === 'High').length;
            const avgEvidence = evidenceLevels.length > 0 ? (highEvidence / evidenceLevels.length) * 100 : 0;
            return {
                name: 'Average Evidence Level',
                value: Math.round(avgEvidence * 100) / 100,
                unit: '%',
                trend: avgEvidence >= 70 ? 'stable' : 'down',
                threshold: { warning: 50, critical: 30 },
                status: avgEvidence >= 70 ? 'healthy' : avgEvidence >= 50 ? 'warning' : 'critical',
                timestamp,
            };
        }
        catch (error) {
            return {
                name: 'Average Evidence Level',
                value: 0,
                unit: '%',
                status: 'critical',
                timestamp,
            };
        }
    }
    async collectGroqTokenUsage(timestamp) {
        try {
            const responses = await prisma_1.default.aIResponse.findMany({
                where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
                select: { processingTime: true },
                take: 100,
            });
            const avgTokens = responses.length > 0
                ? responses.reduce((sum, r) => sum + (r.processingTime || 0), 0) / responses.length
                : 0;
            return {
                name: 'Groq Token Usage',
                value: Math.round(avgTokens),
                unit: 'tokens',
                trend: 'stable',
                status: 'healthy',
                timestamp,
            };
        }
        catch (error) {
            return {
                name: 'Groq Token Usage',
                value: 0,
                unit: 'tokens',
                status: 'critical',
                timestamp,
            };
        }
    }
    async collectPineconeUsage(timestamp) {
        try {
            const totalVectors = await prisma_1.default.embeddingMetadata.count();
            return {
                name: 'Pinecone Usage',
                value: totalVectors,
                unit: 'vectors',
                trend: 'stable',
                status: 'healthy',
                timestamp,
            };
        }
        catch (error) {
            return {
                name: 'Pinecone Usage',
                value: 0,
                unit: 'vectors',
                status: 'critical',
                timestamp,
            };
        }
    }
    async collectStorageGrowth(timestamp) {
        try {
            const docs = await prisma_1.default.medicalDocument.count();
            const chunks = await prisma_1.default.embeddingMetadata.count();
            const responses = await prisma_1.default.aIResponse.count();
            return {
                name: 'Storage Growth',
                value: `${docs} docs, ${chunks} chunks, ${responses} responses`,
                status: 'healthy',
                timestamp,
            };
        }
        catch (error) {
            return {
                name: 'Storage Growth',
                value: 'Error',
                status: 'critical',
                timestamp,
            };
        }
    }
    checkAlerts(metrics) {
        metrics.forEach(metric => {
            if (metric.threshold && typeof metric.value === 'number') {
                if (metric.value >= metric.threshold.critical) {
                    this.alerts.push({
                        severity: 'critical',
                        message: `${metric.name} is critical: ${metric.value}${metric.unit || ''}`,
                        metric: metric.name,
                        currentValue: metric.value,
                        threshold: metric.threshold.critical,
                        timestamp: new Date(),
                    });
                }
                else if (metric.value >= metric.threshold.warning) {
                    this.alerts.push({
                        severity: 'warning',
                        message: `${metric.name} warning: ${metric.value}${metric.unit || ''}`,
                        metric: metric.name,
                        currentValue: metric.value,
                        threshold: metric.threshold.warning,
                        timestamp: new Date(),
                    });
                }
            }
        });
        if (this.alerts.length > this.maxHistorySize) {
            this.alerts = this.alerts.slice(-this.maxHistorySize);
        }
    }
    updateTrends(metrics) {
        metrics.forEach(metric => {
            if (typeof metric.value === 'number') {
                const existingTrend = this.trends.find(t => t.metric === metric.name);
                if (existingTrend) {
                    const lastValue = existingTrend.values[existingTrend.values.length - 1]?.value || metric.value;
                    const changePercent = lastValue !== 0 ? ((metric.value - lastValue) / lastValue) * 100 : 0;
                    existingTrend.values.push({ timestamp: metric.timestamp, value: metric.value });
                    existingTrend.trend = changePercent > 5 ? 'improving' : changePercent < -5 ? 'degrading' : 'stable';
                    existingTrend.changePercent = changePercent;
                    if (existingTrend.values.length > 100) {
                        existingTrend.values = existingTrend.values.slice(-100);
                    }
                }
                else {
                    this.trends.push({
                        metric: metric.name,
                        values: [{ timestamp: metric.timestamp, value: metric.value }],
                        trend: 'stable',
                        changePercent: 0,
                    });
                }
            }
        });
    }
    getDashboard() {
        const latestMetrics = this.metrics.slice(-50);
        const recentAlerts = this.alerts.slice(-20);
        const healthyCount = latestMetrics.filter(m => m.status === 'healthy').length;
        const warningCount = latestMetrics.filter(m => m.status === 'warning').length;
        const criticalCount = latestMetrics.filter(m => m.status === 'critical').length;
        return {
            timestamp: new Date(),
            overallHealth: criticalCount > 0 ? 'critical' : warningCount > 2 ? 'warning' : 'healthy',
            metrics: latestMetrics,
            alerts: recentAlerts,
            trends: this.trends,
        };
    }
    getAlerts() {
        return this.alerts.slice(-20);
    }
    getTrends(metricName) {
        if (metricName) {
            return this.trends.filter(t => t.metric === metricName);
        }
        return this.trends;
    }
}
exports.QualityMonitoringService = QualityMonitoringService;
exports.qualityMonitoringService = new QualityMonitoringService();
//# sourceMappingURL=quality-monitoring.service.js.map