/* eslint-env jest */
import { RetrievalService } from '../../modules/retrieval/retrieval.service';
import { EmbeddingService } from '../../modules/rag/services/embedding.service';

jest.mock('../../modules/rag/services/embedding.service', () => ({
  EmbeddingService: jest.fn().mockImplementation(() => ({
    generateEmbedding: jest.fn().mockResolvedValue(Array(384).fill(0)),
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
  let service: RetrievalService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new RetrievalService();
  });

  describe('semanticSearch', () => {
    it('should return mock results when no Pinecone', async () => {
      const results = await service.semanticSearch('diabetes');

      expect(results).toHaveLength(3);
      expect(results[0]).toHaveProperty('id');
      expect(results[0]).toHaveProperty('score');
    });

    it('should respect topK parameter', async () => {
      const results = await service.semanticSearch('test', 1);

      expect(results).toHaveLength(1);
    });

    it('should include query in mock results', async () => {
      const results = await service.semanticSearch('hypertension');

      expect(results[0].metadata.textPreview).toContain('hypertension');
    });
  });

  describe('hybridSearch', () => {
    it('should perform hybrid search without specialty filter', async () => {
      const results = await service.hybridSearch('diabetes');

      expect(Array.isArray(results)).toBe(true);
    });

    it('should filter by specialty when provided', async () => {
      const results = await service.hybridSearch('heart issue', 'cardiology');

      expect(Array.isArray(results)).toBe(true);
    });

    it('should return all results if no specialty matches', async () => {
      const results = await service.hybridSearch('diabetes', 'neurosurgery');

      expect(Array.isArray(results)).toBe(true);
    });

    it('should rank results by score', async () => {
      const results = await service.hybridSearch('test');

      const sorted = [...results].sort((a, b) => b.score - a.score);
      expect(results).toEqual(sorted);
    });
  });

  describe('pineconeClient getter', () => {
    it('should return null when Pinecone not configured', () => {
      expect(service.pineconeClient).toBeNull();
    });
  });
});