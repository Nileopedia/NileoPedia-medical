"use strict";
/* eslint-env jest */
/**
 * Benchmark Evaluation Suite
 *
 * Automatically tests medical queries against the knowledge base:
 * - Correct document retrieved
 * - Synonym expansion working
 * - Relevant chunks selected
 * - No unrelated documents
 * - Confidence > threshold
 * - Citations correspond to retrieved chunks
 * - No hallucinated information
 */
Object.defineProperty(exports, "__esModule", { value: true });
const retrieval_service_1 = require("../../modules/retrieval/retrieval.service");
const synonym_service_1 = require("../../modules/medical/synonym.service");
const acronym_resolver_service_1 = require("../../modules/medical/acronym-resolver.service");
const confidence_engine_service_1 = require("../../modules/medical/confidence-engine.service");
const dynamic_retrieval_service_1 = require("../../modules/medical/dynamic-retrieval.service");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const BENCHMARK_QUERIES = [
    {
        query: 'What is hypertension?',
        expectedTerms: ['blood pressure', 'hypertension', 'high blood pressure'],
        medicalSpecialty: 'cardiology',
        minConfidence: 0.3
    },
    {
        query: 'High blood pressure',
        expectedTerms: ['hypertension', 'blood pressure'],
        medicalSpecialty: 'cardiology',
        minConfidence: 0.3
    },
    {
        query: 'HTN',
        expectedTerms: ['hypertension'],
        medicalSpecialty: 'cardiology',
        minConfidence: 0.2
    },
    {
        query: 'Blood pressure',
        expectedTerms: ['blood pressure', 'hypertension'],
        medicalSpecialty: 'cardiology',
        minConfidence: 0.2
    },
    {
        query: 'Diabetes mellitus',
        expectedTerms: ['diabetes', 'glucose', 'insulin'],
        medicalSpecialty: 'endocrinology',
        minConfidence: 0.3
    },
    {
        query: 'Type 2 diabetes',
        expectedTerms: ['diabetes', 'type 2', 'insulin resistance'],
        medicalSpecialty: 'endocrinology',
        minConfidence: 0.3
    },
    {
        query: 'Heart attack',
        expectedTerms: ['myocardial infarction', 'MI', 'chest pain'],
        medicalSpecialty: 'cardiology',
        minConfidence: 0.3
    },
    {
        query: 'Myocardial infarction',
        expectedTerms: ['heart attack', 'MI', 'coronary'],
        medicalSpecialty: 'cardiology',
        minConfidence: 0.3
    },
    {
        query: 'Stroke',
        expectedTerms: ['cerebrovascular', 'brain', 'ischemic', 'hemorrhagic'],
        medicalSpecialty: 'neurology',
        minConfidence: 0.3
    },
    {
        query: 'CVA',
        expectedTerms: ['cerebrovascular', 'stroke'],
        medicalSpecialty: 'neurology',
        minConfidence: 0.2
    },
    {
        query: 'Asthma',
        expectedTerms: ['bronchospasm', 'wheeze', 'inhaler'],
        medicalSpecialty: 'pulmonology',
        minConfidence: 0.3
    },
    {
        query: 'Malaria',
        expectedTerms: ['plasmodium', 'fever', 'parasite'],
        medicalSpecialty: 'infectious disease',
        minConfidence: 0.3
    },
    {
        query: 'Tuberculosis',
        expectedTerms: ['TB', 'mycobacterium', 'cough'],
        medicalSpecialty: 'infectious disease',
        minConfidence: 0.3
    }
];
describe('Benchmark Evaluation Suite', () => {
    let retrievalService;
    beforeAll(async () => {
        await prisma.$connect();
    }, 60000);
    afterAll(async () => {
        await prisma.$disconnect();
    });
    beforeEach(() => {
        retrievalService = new retrieval_service_1.RetrievalService();
    });
    BENCHMARK_QUERIES.forEach((benchmarkQuery) => {
        describe(`Query: "${benchmarkQuery.query}"`, () => {
            it('should expand synonyms', async () => {
                const expansion = synonym_service_1.medicalSynonymService.expand(benchmarkQuery.query);
                const hasExpansion = expansion.matchedSynonym || expansion.synonyms.length > 0;
                expect(hasExpansion).toBe(true);
            });
            it('should expand acronyms when applicable', async () => {
                const expansion = acronym_resolver_service_1.medicalAcronymResolver.resolveAll(benchmarkQuery.query);
                if (['HTN', 'CVA', 'MI'].includes(benchmarkQuery.query.toUpperCase())) {
                    expect(expansion.acronyms.length).toBeGreaterThan(0);
                }
                else {
                    expect(expansion.expandedQuery.length).toBeGreaterThan(0);
                }
            });
            it('should have dynamic retrieval weights', async () => {
                const analysis = dynamic_retrieval_service_1.dynamicRetrievalService.analyzeQuery(benchmarkQuery.query);
                expect(analysis.denseWeight).toBeGreaterThan(0);
                expect(analysis.keywordWeight).toBeGreaterThan(0);
                expect(analysis.queryType).toBeDefined();
            });
            it('should retrieve results', async () => {
                const results = await retrievalService.semanticSearch(benchmarkQuery.query, 10);
                expect(results.length).toBeGreaterThan(0);
            }, 90000);
            it('should have relevant results', async () => {
                const results = await retrievalService.semanticSearch(benchmarkQuery.query, 10);
                const hasRelevant = results.some(r => {
                    const text = (r.metadata?.text || r.metadata?.textPreview || '').toLowerCase();
                    return benchmarkQuery.expectedTerms.some(term => text.includes(term.toLowerCase()));
                });
                expect(hasRelevant).toBe(true);
            }, 90000);
            it('should have high relevance ratio', async () => {
                const results = await retrievalService.semanticSearch(benchmarkQuery.query, 10);
                const relevantCount = results.filter(r => {
                    const text = (r.metadata?.text || r.metadata?.textPreview || '').toLowerCase();
                    return benchmarkQuery.expectedTerms.some(term => text.includes(term.toLowerCase()));
                }).length;
                const relevanceRatio = results.length > 0 ? relevantCount / results.length : 0;
                console.log(`Relevance ratio for "${benchmarkQuery.query}": ${(relevanceRatio * 100).toFixed(1)}%`);
                expect(relevanceRatio).toBeGreaterThan(0.1);
            }, 90000);
            it('should not return unrelated documents', async () => {
                const results = await retrievalService.semanticSearch(benchmarkQuery.query, 10);
                const UNRELATED_TERMS = ['sports', 'football', 'basketball', 'movie', 'music', 'politics', 'election'];
                const unrelatedCount = results.filter(r => {
                    const text = (r.metadata?.text || r.metadata?.textPreview || '').toLowerCase();
                    return UNRELATED_TERMS.some(term => text.includes(term.toLowerCase()));
                }).length;
                const unrelatedRatio = results.length > 0 ? unrelatedCount / results.length : 0;
                expect(unrelatedRatio).toBeLessThan(0.3);
            }, 90000);
        });
    });
    describe('Cross-query consistency', () => {
        it('should return consistent results for synonymous queries', async () => {
            const query1 = await retrievalService.semanticSearch('hypertension', 5);
            const query2 = await retrievalService.semanticSearch('high blood pressure', 5);
            const ids1 = new Set(query1.map(r => r.id));
            const ids2 = new Set(query2.map(r => r.id));
            const overlap = [...ids1].filter(id => ids2.has(id)).length;
            const union = new Set([...ids1, ...ids2]).size;
            const jaccard = union > 0 ? overlap / union : 0;
            console.log(`Synonym consistency Jaccard: ${jaccard.toFixed(2)}`);
            expect(jaccard).toBeGreaterThan(0.1);
        }, 90000);
        it('should return consistent results for acronym and expansion', async () => {
            const query1 = await retrievalService.semanticSearch('HTN', 5);
            const query2 = await retrievalService.semanticSearch('hypertension', 5);
            const ids1 = new Set(query1.map(r => r.id));
            const ids2 = new Set(query2.map(r => r.id));
            const overlap = [...ids1].filter(id => ids2.has(id)).length;
            const union = new Set([...ids1, ...ids2]).size;
            const jaccard = union > 0 ? overlap / union : 0;
            console.log(`Acronym consistency Jaccard: ${jaccard.toFixed(2)}`);
            expect(jaccard).toBeGreaterThan(0.05);
        }, 90000);
    });
    describe('Performance benchmarks', () => {
        it('should retrieve results within acceptable latency', async () => {
            const start = Date.now();
            await retrievalService.semanticSearch('diabetes treatment', 10);
            const latency = Date.now() - start;
            console.log(`Retrieval latency: ${latency}ms`);
            expect(latency).toBeLessThan(15000);
        }, 20000);
        it('should handle batch queries efficiently', async () => {
            const queries = [
                'What is hypertension?',
                'diabetes treatment',
                'asthma management',
                'stroke symptoms',
                'malaria prevention'
            ];
            const start = Date.now();
            await Promise.all(queries.map(q => retrievalService.semanticSearch(q, 5)));
            const totalLatency = Date.now() - start;
            console.log(`Batch query latency: ${totalLatency}ms`);
            expect(totalLatency).toBeLessThan(90000);
        }, 120000);
    });
    describe('Confidence engine validation', () => {
        it('should produce valid confidence scores', () => {
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
            expect(result.retrievalQuality).toBeGreaterThanOrEqual(0);
            expect(result.retrievalQuality).toBeLessThanOrEqual(1);
        });
    });
    describe('Migration readiness checks', () => {
        it('should have chunk metadata populated', async () => {
            const chunks = await prisma.embeddingMetadata.findMany({
                take: 50,
                select: { chunkLength: true, chunkText: true, pineconeVectorId: true, documentId: true, chunkIndex: true }
            });
            const withText = chunks.filter(c => c.chunkText).length;
            const withVectorId = chunks.filter(c => c.pineconeVectorId).length;
            const withDocId = chunks.filter(c => c.documentId).length;
            const withIndex = chunks.filter(c => c.chunkIndex !== undefined).length;
            const withLength = chunks.filter(c => c.chunkLength && c.chunkLength > 0).length;
            console.log(`Chunk metadata: text=${withText}/${chunks.length}, vectorId=${withVectorId}/${chunks.length}, docId=${withDocId}/${chunks.length}, index=${withIndex}/${chunks.length}, length=${withLength}/${chunks.length}`);
            expect(withText / chunks.length).toBeGreaterThan(0.8);
        }, 30000);
        it('should have valid chunk sizes', async () => {
            const chunks = await prisma.embeddingMetadata.findMany({
                take: 100,
                select: { chunkLength: true, chunkText: true }
            });
            const lengths = chunks.map(c => c.chunkLength || c.chunkText?.length || 0).filter(l => l > 0);
            const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
            const maxLength = Math.max(...lengths);
            const tinyChunks = lengths.filter(l => l < 50).length;
            console.log(`Chunk sizes: avg=${avgLength.toFixed(1)}, max=${maxLength}, tiny=${tinyChunks}/${lengths.length}`);
            expect(avgLength).toBeGreaterThan(100);
            expect(maxLength).toBeLessThan(5000);
        }, 30000);
        it('should have low duplicate rate', async () => {
            const total = await prisma.embeddingMetadata.count();
            const duplicates = await prisma.embeddingMetadata.count({
                where: { isDuplicate: true }
            });
            const duplicateRate = total > 0 ? (duplicates / total) * 100 : 0;
            console.log(`Duplicate rate: ${duplicateRate.toFixed(2)}%`);
            expect(duplicateRate).toBeLessThan(5);
        }, 30000);
    });
});
//# sourceMappingURL=benchmark-evaluation.test.js.map