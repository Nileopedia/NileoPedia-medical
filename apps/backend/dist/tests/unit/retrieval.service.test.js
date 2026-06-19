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
jest.mock('../../config/env', () => ({
    CONFIG: {
        PINECONE_API_KEY: undefined,
        PINECONE_INDEX_NAME: 'test-index',
        USE_MOCK_EMBEDDINGS: true,
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
        expect(service.pineconeClient).toBeNull();
    });
    it('should return mock results for semanticSearch', async () => {
        const results = await service.semanticSearch('test query');
        expect(Array.isArray(results)).toBe(true);
    });
    it('should return mock results for hybridSearch', async () => {
        const results = await service.hybridSearch('test query');
        expect(Array.isArray(results)).toBe(true);
    });
});
//# sourceMappingURL=retrieval.service.test.js.map