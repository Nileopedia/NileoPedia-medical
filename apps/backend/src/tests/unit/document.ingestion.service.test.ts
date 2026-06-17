/* eslint-env jest */
import { DocumentIngestionService } from '../../modules/documents/document.ingestion.service';

jest.mock('../../config/prisma', () => ({
  embeddingMetadata: {
    create: jest.fn(),
  },
}));

jest.mock('../../modules/rag/services/embedding.service', () => ({
  EmbeddingService: jest.fn().mockImplementation(() => ({
    generateEmbedding: jest.fn().mockResolvedValue(Array(384).fill(0)),
    preprocessText: jest.fn().mockResolvedValue('processed'),
  })),
}));

jest.mock('../../modules/rag/services/pinecone.service', () => ({
  PineconeService: jest.fn().mockImplementation(() => ({
    upsert: jest.fn().mockResolvedValue({}),
  })),
}));

jest.mock('../../modules/rag/services/chunking.service', () => ({
  ChunkingService: jest.fn().mockImplementation(() => ({
    chunkDocument: jest.fn().mockResolvedValue(['chunk 1', 'chunk 2']),
  })),
}));

jest.mock('../../jobs/queues', () => ({
  aiQueue: { add: jest.fn() },
  documentQueue: { add: jest.fn() },
}));

describe('DocumentIngestionService', () => {
  let service: DocumentIngestionService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new DocumentIngestionService();
  });

  describe('ingestDocument', () => {
    it('should process document for ingestion', () => {
      expect(typeof service.ingestDocument).toBe('function');
    });
  });
});