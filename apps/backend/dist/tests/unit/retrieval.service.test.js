"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-env jest */
const retrieval_service_1 = require("../../modules/retrieval/retrieval.service");
jest.mock('../../modules/rag/services/embedding.service', () => ({
    EmbeddingService: jest.fn().mockImplementation(() => ({
        generateEmbedding: jest.fn().mockResolvedValue(Array(384).fill(0.5)),
        embeddingSource: 'mock',
    })),
}));
const mockMatches = [
    { id: 'm1', score: 0.95, metadata: { title: 'Hypertension Guide', text: 'High blood pressure info' } },
    { id: 'm2', score: 0.80, metadata: { title: 'Blood Pressure Management', text: 'Management strategies' } },
    { id: 'm3', score: 0.50, metadata: { title: 'FIFA World Cup', text: 'Football tournament' } },
];
jest.mock('@pinecone-database/pinecone', () => {
    const mocked = {
        Pinecone: jest.fn().mockImplementation(() => ({
            index: jest.fn().mockReturnValue({
                query: jest.fn().mockResolvedValue({ matches: mockMatches }),
            }),
        })),
    };
    return mocked;
});
jest.mock('../../config/env', () => ({
    CONFIG: {
        PINECONE_API_KEY: 'test-key',
        PINECONE_INDEX_NAME: 'test-index',
        USE_MOCK_EMBEDDINGS: false,
    },
}));
jest.mock('../../config/logger', () => ({
    logger: { info: jest.fn(), error: jest.fn() },
}));
describe('RetrievalService', () => {
    let service;
    beforeEach(() => {
        jest.clearAllMocks();
        service = new retrieval_service_1.RetrievalService();
    });
    it('should exist', () => {
        expect(service).toBeDefined();
    });
    it('should have semanticSearch method', () => {
        expect(typeof service.semanticSearch).toBe('function');
    });
    it('should have hybridSearch method', () => {
        expect(typeof service.hybridSearch).toBe('function');
    });
    it('should have pineconeClient getter', () => {
        expect(service.pineconeClient).toBeTruthy();
    });
    it('should return results for semanticSearch', async () => {
        const results = await service.semanticSearch('test query');
        expect(Array.isArray(results)).toBe(true);
        expect(results.length).toBeGreaterThan(0);
    });
    it('should return results for hybridSearch', async () => {
        const results = await service.hybridSearch('test query');
        expect(Array.isArray(results)).toBe(true);
        expect(results.length).toBeGreaterThan(0);
    });
    it('isMedicalQuery should allow "what is malaria" via term containment', async () => {
        const result = await service.isMedicalQuery('what is malaria', service.embeddingService);
        expect(result).toBe(true);
    });
    it('isMedicalQuery should allow "what is hypertension" via term containment', async () => {
        const result = await service.isMedicalQuery('what is hypertension', service.embeddingService);
        expect(result).toBe(true);
    });
    it('isMedicalQuery should allow "diabetes symptoms" via term containment', async () => {
        const result = await service.isMedicalQuery('diabetes symptoms', service.embeddingService);
        expect(result).toBe(true);
    });
    it('isMedicalQuery should allow "asthma treatment" via term containment', async () => {
        const result = await service.isMedicalQuery('asthma treatment', service.embeddingService);
        expect(result).toBe(true);
    });
    it('isMedicalQuery should allow "causes of fever" via term containment', async () => {
        const result = await service.isMedicalQuery('causes of fever', service.embeddingService);
        expect(result).toBe(true);
    });
    it('isMedicalQuery should block "Who won FIFA World Cup" via semantic fallback', async () => {
        const nonMedicalEmbedding = Array(384).fill(-0.5);
        const mockGenerateEmbedding = jest
            .fn()
            .mockImplementationOnce((text) => {
            if (text === 'who won fifa world cup') {
                return Promise.resolve(nonMedicalEmbedding);
            }
            return Promise.resolve(Array(384).fill(0.5));
        });
        service.embeddingService.generateEmbedding = mockGenerateEmbedding;
        const result = await service.isMedicalQuery('Who won FIFA World Cup', service.embeddingService);
        expect(result).toBe(false);
    });
    it('isMedicalQuery should block "Who is Messi" via semantic fallback', async () => {
        const nonMedicalEmbedding = Array(384).fill(-0.5);
        const mockGenerateEmbedding = jest
            .fn()
            .mockImplementationOnce((text) => {
            if (text === 'who is messi') {
                return Promise.resolve(nonMedicalEmbedding);
            }
            return Promise.resolve(Array(384).fill(0.5));
        });
        service.embeddingService.generateEmbedding = mockGenerateEmbedding;
        const result = await service.isMedicalQuery('Who is Messi', service.embeddingService);
        expect(result).toBe(false);
    });
});
//# sourceMappingURL=retrieval.service.test.js.map