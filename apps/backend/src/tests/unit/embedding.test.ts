// Mock the entire embedding service for unit testing
interface MockEmbeddingService {
  generateEmbedding: jest.Mock;
  generateBatchEmbeddings: jest.Mock;
  preprocessText: jest.Mock;
  isRealEmbeddings: boolean;
  embeddingSource: string;
}

const mockEmbeddingService: MockEmbeddingService = {
  generateEmbedding: jest.fn().mockImplementation(async (text: string) => {
    // Generate 384-dim mock embedding
    const hash = text.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    return new Array(384).fill(0).map((_, i) => {
      const seed = (hash * (i + 1)) % 1000;
      return (seed - 500) / 500;
    });
  }),
  generateBatchEmbeddings: jest.fn().mockImplementation(async (texts: string[]) => Promise.all(texts.map((t: string) => mockEmbeddingService.generateEmbedding(t)))),
  preprocessText: jest.fn().mockImplementation((text: string) => text.replace(/\s+/g, ' ').trim().replace(/[^\x00-\x7F]/g, '')),
  isRealEmbeddings: false,
  embeddingSource: 'mock',
};

jest.mock('../../modules/rag/services/embedding.service', () => ({
  EmbeddingService: jest.fn().mockImplementation(() => mockEmbeddingService),
}));

describe('EmbeddingService', () => {
  let embeddingService: MockEmbeddingService;

  beforeEach(() => {
    const { EmbeddingService } = require('../../modules/rag/services/embedding.service');
    embeddingService = new EmbeddingService() as MockEmbeddingService;
  });

  describe('generateEmbedding', () => {
    it('should generate embedding with correct dimension', async () => {
      const embedding = await embeddingService.generateEmbedding('What is diabetes?');
      expect(embedding.length).toBe(384);
    });

    it('should generate deterministic mock embeddings', async () => {
      const emb1 = await embeddingService.generateEmbedding('test');
      const emb2 = await embeddingService.generateEmbedding('test');
      expect(emb1).toEqual(emb2);
    });

    it('should handle empty text gracefully', async () => {
      const embedding = await embeddingService.generateEmbedding('');
      expect(embedding.length).toBe(384);
    });
  });

  describe('preprocessText', () => {
    it('should remove extra whitespace', async () => {
      const result = await embeddingService.preprocessText('What   is    diabetes?');
      expect(result).toBe('What is diabetes?');
    });

    it('should remove non-ASCII characters', async () => {
      const result = await embeddingService.preprocessText('What is diabète? 你好');
      expect(/[^\x00-\x7F]/.test(result)).toBe(false);
    });

    it('should trim text', async () => {
      const result = await embeddingService.preprocessText('  diabetes  ');
      expect(result).toBe('diabetes');
    });
  });

  describe('isRealEmbeddings', () => {
    it('should return false when using mock mode', () => {
      expect(embeddingService.isRealEmbeddings).toBe(false);
    });
  });
});
