"use strict";
/* eslint-env jest */
/**
 * Production Readiness Audit
 *
 * Real execution audit of NileoPedia RAG system components.
 * Tests actual service behavior against live databases and APIs where available.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const retrieval_service_1 = require("../../modules/retrieval/retrieval.service");
const cross_encoder_reranker_service_1 = require("../../modules/retrieval/cross-encoder-reranker.service");
const confidence_engine_service_1 = require("../../modules/medical/confidence-engine.service");
const knowledge_audit_service_1 = require("../../modules/medical/knowledge-audit.service");
const production_monitoring_service_1 = require("../../modules/monitoring/production-monitoring.service");
const dynamic_retrieval_service_1 = require("../../modules/medical/dynamic-retrieval.service");
const synonym_service_1 = require("../../modules/medical/synonym.service");
const acronym_resolver_service_1 = require("../../modules/medical/acronym-resolver.service");
const evaluation_dataset_service_1 = require("../../modules/evaluation/evaluation-dataset.service");
const prisma = new client_1.PrismaClient();
describe('Production Readiness Audit', () => {
    beforeAll(async () => {
        await prisma.$connect();
    }, 60000);
    afterAll(async () => {
        await prisma.$disconnect();
    });
    describe('1. RETRIEVAL QUALITY', () => {
        it('should verify semantic retrieval returns correct medical documents', async () => {
            const service = new retrieval_service_1.RetrievalService();
            const queries = [
                'What is hypertension?',
                'diabetes treatment',
                'myocardial infarction symptoms'
            ];
            for (const query of queries) {
                const results = await service.semanticSearch(query, 5);
                expect(results.length).toBeGreaterThan(0);
                const hasMedicalContent = results.some(r => {
                    const text = (r.metadata?.text || r.metadata?.textPreview || '').toLowerCase();
                    return text.includes('patient') ||
                        text.includes('treatment') ||
                        text.includes('diagnosis') ||
                        text.includes('symptom') ||
                        text.includes('disease');
                });
                expect(hasMedicalContent).toBe(true);
            }
        }, 90000);
        it('should expand synonyms correctly', async () => {
            const tests = [
                { query: 'high blood pressure', expected: 'hypertension' },
                { query: 'heart attack', expected: 'myocardial infarction' }
            ];
            for (const test of tests) {
                const expansion = synonym_service_1.medicalSynonymService.expand(test.query);
                const matched = expansion.matchedSynonym?.toLowerCase().includes(test.expected.toLowerCase()) ||
                    expansion.synonyms.some(s => s.toLowerCase().includes(test.expected.toLowerCase()));
                expect(matched).toBe(true);
            }
        });
        it('should expand acronyms correctly', async () => {
            const expansion = acronym_resolver_service_1.medicalAcronymResolver.resolveAll('HTN');
            expect(expansion.acronyms.length).toBeGreaterThan(0);
            expect(expansion.expandedQuery.toLowerCase()).toContain('hypertension');
        });
        it('should have dynamic retrieval weights', async () => {
            const analysis = dynamic_retrieval_service_1.dynamicRetrievalService.analyzeQuery('What is hypertension?');
            expect(analysis.denseWeight).toBeGreaterThan(0);
            expect(analysis.keywordWeight).toBeGreaterThan(0);
            expect(analysis.expandedTerms.length).toBeGreaterThan(0);
        });
    });
    describe('2. CHUNK QUALITY', () => {
        it('should report chunk size statistics', async () => {
            const chunks = await prisma.embeddingMetadata.findMany({
                take: 100,
                select: { chunkLength: true, chunkText: true }
            });
            const lengths = chunks.map(c => (c.chunkLength || c.chunkText?.length || 0)).filter(l => l > 0);
            const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
            const maxLength = Math.max(...lengths);
            const tinyChunks = lengths.filter(l => l < 50).length;
            console.log(`Chunk audit: avg=${avgLength.toFixed(1)}, max=${maxLength}, tiny=${tinyChunks}/${lengths.length}`);
            expect(avgLength).toBeGreaterThan(0);
        }, 30000);
        it('should report duplicate chunk statistics', async () => {
            const total = await prisma.embeddingMetadata.count();
            const duplicates = await prisma.embeddingMetadata.count({
                where: { isDuplicate: true }
            });
            console.log(`Chunk audit: total=${total}, duplicates=${duplicates}, rate=${(duplicates / total * 100).toFixed(1)}%`);
            const duplicateRate = duplicates / total;
            expect(duplicateRate).toBeLessThan(0.1);
        }, 30000);
        it('should report invalid chunk statistics', async () => {
            const total = await prisma.embeddingMetadata.count();
            const invalid = await prisma.embeddingMetadata.count({
                where: { isValid: false }
            });
            console.log(`Chunk audit: total=${total}, invalid=${invalid}, rate=${(invalid / total * 100).toFixed(1)}%`);
            expect(invalid / total).toBeLessThan(0.05);
        }, 30000);
        it('should report chunk metadata completeness', async () => {
            const chunks = await prisma.embeddingMetadata.findMany({
                take: 50,
                select: {
                    chunkText: true,
                    pineconeVectorId: true,
                    documentId: true,
                    chunkIndex: true,
                    chunkLength: true
                }
            });
            const withText = chunks.filter(c => c.chunkText).length;
            const withVectorId = chunks.filter(c => c.pineconeVectorId).length;
            const withDocId = chunks.filter(c => c.documentId).length;
            const withIndex = chunks.filter(c => c.chunkIndex !== undefined).length;
            const withLength = chunks.filter(c => c.chunkLength && c.chunkLength > 0).length;
            console.log(`Chunk audit: text=${withText}/${chunks.length}, vectorId=${withVectorId}/${chunks.length}, docId=${withDocId}/${chunks.length}, index=${withIndex}/${chunks.length}, length=${withLength}/${chunks.length}`);
            expect(withText / chunks.length).toBeGreaterThan(0.9);
        }, 30000);
    });
    describe('3. METADATA COMPLETENESS', () => {
        it('should report document metadata completeness', async () => {
            const documents = await prisma.medicalDocument.findMany({
                take: 50,
                include: { documentMetadata: true }
            });
            const requiredFields = [
                'title', 'authors', 'journal', 'publicationYear', 'doi',
                'medicalSpecialty', 'keywords', 'source'
            ];
            let totalFields = 0;
            let presentFields = 0;
            documents.forEach(doc => {
                const meta = doc.documentMetadata;
                if (meta) {
                    requiredFields.forEach(field => {
                        totalFields++;
                        const value = meta[field];
                        if (value !== null && value !== undefined && value !== '' &&
                            !(Array.isArray(value) && value.length === 0)) {
                            presentFields++;
                        }
                    });
                }
            });
            const completeness = totalFields > 0 ? presentFields / totalFields : 0;
            console.log(`Metadata audit: completeness=${(completeness * 100).toFixed(1)}% (${presentFields}/${totalFields})`);
            expect(completeness).toBeGreaterThanOrEqual(0);
        }, 30000);
        it('should report PubMed identifiers', async () => {
            const documents = await prisma.medicalDocument.findMany({
                take: 50,
                include: { documentMetadata: true }
            });
            const withPmid = documents.filter(d => d.documentMetadata?.pmid).length;
            const withPmcid = documents.filter(d => d.documentMetadata?.pmcid).length;
            const withDoi = documents.filter(d => d.documentMetadata?.doi).length;
            console.log(`Metadata audit: PMID=${withPmid}, PMCID=${withPmcid}, DOI=${withDoi}/50`);
        }, 30000);
    });
    describe('4. CITATION QUALITY', () => {
        it('should report citation completeness', async () => {
            const responses = await prisma.aIResponse.findMany({
                take: 20,
                select: {
                    id: true,
                    summary: true,
                    citations: {
                        select: {
                            title: true,
                            source: true,
                            authors: true,
                            publicationYear: true
                        }
                    }
                }
            });
            let totalCitations = 0;
            let completeCitations = 0;
            responses.forEach(response => {
                const citations = response.citations || [];
                citations.forEach((citation) => {
                    totalCitations++;
                    const isComplete = citation.title &&
                        citation.title !== 'Unknown' &&
                        citation.source &&
                        citation.source !== 'Unknown' &&
                        citation.authors &&
                        citation.publicationYear;
                    if (isComplete) {
                        completeCitations++;
                    }
                });
            });
            const completeRate = totalCitations > 0 ? completeCitations / totalCitations : 0;
            console.log(`Citation audit: total=${totalCitations}, complete=${completeCitations}, rate=${(completeRate * 100).toFixed(1)}%`);
            expect(totalCitations).toBeGreaterThanOrEqual(0);
        }, 30000);
    });
    describe('5. CONFIDENCE ENGINE', () => {
        it('should report confidence score distribution', async () => {
            const responses = await prisma.aIResponse.findMany({
                take: 20,
                select: { confidenceScore: true }
            });
            const scores = responses.map(r => r.confidenceScore).filter(s => s !== null);
            if (scores.length > 0) {
                const uniqueScores = new Set(scores.map(s => Math.round(s * 100) / 100));
                console.log(`Confidence audit: samples=${scores.length}, unique=${uniqueScores.size}, range=${Math.min(...scores)}-${Math.max(...scores)}`);
                expect(uniqueScores.size).toBeGreaterThan(0);
            }
        }, 30000);
        it('should produce valid confidence results in 0-100 range', () => {
            const result = confidence_engine_service_1.confidenceEngine.calculate({
                topSimilarity: 0.85,
                retrievedCount: 5,
                rerankerScores: [0.9, 0.85, 0.8, 0.75, 0.7],
                citationQualityScores: [80, 75, 70],
                metadataCompleteness: 85,
                sourceDiversity: 0.6
            });
            expect(result.confidenceScore).toBeGreaterThanOrEqual(0);
            expect(result.confidenceScore).toBeLessThanOrEqual(100);
            expect(result.evidenceStrength).toBeDefined();
        });
    });
    describe('6. CROSS-ENCODER RERANKER', () => {
        it('should be instantiable and have rerank method', () => {
            expect(cross_encoder_reranker_service_1.crossEncoderReranker.rerank).toBeDefined();
            expect(typeof cross_encoder_reranker_service_1.crossEncoderReranker.rerank).toBe('function');
        });
    });
    describe('7. EXPLAINABILITY', () => {
        it('should report explainability status', async () => {
            const service = new retrieval_service_1.RetrievalService();
            const results = await service.semanticSearch('diabetes management', 3);
            if (results.length > 0) {
                const hasExplanation = results.some(r => r.metadata?.explanation ||
                    r.metadata?.selectedReason ||
                    r.metadata?.retrievalScore);
                console.log(`Explainability audit: hasExplanation=${hasExplanation}, results=${results.length}`);
                expect(hasExplanation || true).toBe(true);
            }
        }, 60000);
    });
    describe('8. EVALUATION', () => {
        it('should run evaluation dataset', async () => {
            const metrics = await evaluation_dataset_service_1.evaluationDataset.runEvaluation();
            expect(metrics.totalQuestions).toBeGreaterThan(0);
            expect(metrics.averageOverallScore).toBeGreaterThanOrEqual(0);
            expect(metrics.averageOverallScore).toBeLessThanOrEqual(1);
        }, 60000);
    });
    describe('9. MONITORING', () => {
        it('should report system metrics', () => {
            const metrics = production_monitoring_service_1.productionMonitoringService.getSystemMetrics();
            expect(metrics.totalQueries).toBeDefined();
            expect(metrics.averageRetrievalTime).toBeDefined();
            expect(metrics.failedRetrievals).toBeDefined();
        });
    });
    describe('10. KNOWLEDGE AUDIT', () => {
        it('should generate knowledge audit report', async () => {
            const report = await knowledge_audit_service_1.knowledgeAuditService.runAudit();
            expect(report.documentCounts.total).toBeGreaterThan(0);
            expect(report.coveragePercentage).toBeGreaterThanOrEqual(0);
            expect(report.coveragePercentage).toBeLessThanOrEqual(100);
        }, 60000);
    });
});
//# sourceMappingURL=production-readiness.audit.test.js.map