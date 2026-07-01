/* eslint-env jest */
import { RetrievalService } from '../../modules/retrieval/retrieval.service';
import { EmbeddingService } from '../../modules/rag/services/embedding.service';

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
  let service: RetrievalService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new RetrievalService();
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

  it('getRelevantDocs should return hasContext=true when docs meet threshold', async () => {
    const result = await service.getRelevantDocs('hypertension', 10, 0.75);
    expect(result.hasContext).toBe(true);
    expect((result as any).context.length).toBeGreaterThan(0);
    expect((result as any).context.every((d: any) => d.score >= 0.75)).toBe(true);
  });

  it('getRelevantDocs should return hasContext=false when no docs meet threshold', async () => {
    const result = await service.getRelevantDocs('world cup', 10, 0.99);
    expect(result.hasContext).toBe(false);
    expect((result as any).context).toBe('');
  });
});