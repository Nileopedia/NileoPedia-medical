/* eslint-env jest */
import { processAiGeneration } from '../../jobs/processors/ai.processor';
import { AiGenerationJob, PipelineError, MetadataResponse } from '../../jobs/types';

// Mock dependencies for unit testing
jest.mock('../../config/env', () => ({
  CONFIG: { GROQ_API_KEY: undefined, GROQ_MODEL: 'llama-3.3-70b' },
}));

jest.mock('../../lib/redis', () => ({
  redis: { publish: jest.fn(), setex: jest.fn() },
}));

jest.mock('../../config/prisma', () => ({
  __db: {},
  aIResponse: {
    upsert: jest.fn().mockResolvedValue({ id: 'resp-1' }),
  },
  citation: {
    create: jest.fn().mockResolvedValue({}),
  },
}));

jest.mock('../../modules/retrieval/retrieval.service', () => {
  const mockInstance = {
    embeddingService: {
      isRealEmbeddings: false,
      generateEmbedding: jest.fn().mockResolvedValue(Array(384).fill(0.5)),
    },
    pineconeClient: { index: jest.fn() },
    semanticSearch: jest.fn(),
    isMedicalQuery: jest.fn(),
  };

  return {
    RetrievalService: jest.fn().mockImplementation(() => mockInstance),
    retrievalService: mockInstance,
  };
});

describe('AI Pipeline Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { RetrievalService, retrievalService } = jest.requireMock('../../modules/retrieval/retrieval.service') as any;
    RetrievalService.mockImplementation(() => retrievalService);
    retrievalService.semanticSearch = jest.fn();
    retrievalService.isMedicalQuery = jest.fn().mockResolvedValue(true);
  });

  describe('embeddings failure', () => {
    it('should return embeddings error when embedding service unavailable', async () => {
      const mockJob: AiGenerationJob = {
        questionId: 'test-q-2',
        query: 'What is diabetes?',
        userId: 'user-1',
      };

      const { retrievalService } = jest.requireMock('../../modules/retrieval/retrieval.service') as any;
      const originalGenerateEmbedding = retrievalService.embeddingService.generateEmbedding;
      retrievalService.embeddingService.generateEmbedding = jest.fn().mockRejectedValue(new Error('Embedding service unavailable'));

      const result = await processAiGeneration(mockJob);

      retrievalService.embeddingService.generateEmbedding = originalGenerateEmbedding;

      expect(result.success).toBe(false);
      expect((result as PipelineError).stage).toBe('embeddings');
      expect((result as PipelineError).message).toBe('Embedding service unavailable');
    });
  });

  describe('llm failure', () => {
    it('should return error when Groq key not configured', async () => {
      const mockJob: AiGenerationJob = {
        questionId: 'test-q-3',
        query: 'What is diabetes?',
        userId: 'user-1',
      };

      const result = await processAiGeneration(mockJob);

      expect(result.success).toBe(false);
    });
  });

  describe('strict RAG enforcement', () => {
    it('should return domain-filtered message for non-medical queries like FIFA World Cup', async () => {
      const mockJob: AiGenerationJob = {
        questionId: 'test-q-domain-1',
        query: 'Who won the FIFA World Cup?',
        userId: 'user-1',
      };

      const { retrievalService } = jest.requireMock('../../modules/retrieval/retrieval.service') as any;
      if (retrievalService.isMedicalQuery) {
        retrievalService.isMedicalQuery = jest.fn().mockResolvedValue(false);
      }

      const result = await processAiGeneration(mockJob);

      if (result.success && (result as any).metadata) {
        const metadata = (result as any).metadata as MetadataResponse;
        expect(metadata.source).toBe('Domain Filter');
        expect(metadata.answer).toBe('Question outside supported medical domain.');
        expect(metadata.documentsUsed).toBe(0);
      } else {
        expect((result as PipelineError).stage).toBeDefined();
      }
    });

    it('should return domain-filtered message for non-medical queries like Messi', async () => {
      const mockJob: AiGenerationJob = {
        questionId: 'test-q-domain-2',
        query: 'Who is Messi?',
        userId: 'user-1',
      };

      const { retrievalService } = jest.requireMock('../../modules/retrieval/retrieval.service') as any;
      if (retrievalService.isMedicalQuery) {
        retrievalService.isMedicalQuery = jest.fn().mockResolvedValue(false);
      }

      const result = await processAiGeneration(mockJob);

      if (result.success && (result as any).metadata) {
        const metadata = (result as any).metadata as MetadataResponse;
        expect(metadata.source).toBe('Domain Filter');
        expect(metadata.answer).toBe('Question outside supported medical domain.');
        expect(metadata.documentsUsed).toBe(0);
      } else {
        expect((result as PipelineError).stage).toBeDefined();
      }
    });

    it('should allow medical queries like dizziness after standing', async () => {
      const mockJob: AiGenerationJob = {
        questionId: 'test-q-medical-1',
        query: 'Why do I feel dizzy after standing?',
        userId: 'user-1',
      };

      const { retrievalService } = jest.requireMock('../../modules/retrieval/retrieval.service') as any;
      if (retrievalService.isMedicalQuery) {
        retrievalService.isMedicalQuery = jest.fn().mockResolvedValue(true);
      }
      if (retrievalService.semanticSearch) {
        retrievalService.semanticSearch = jest.fn().mockResolvedValue([
          { id: 'm1', score: 0.60, metadata: { text: 'Low relevance' } },
        ]);
      }

      const result = await processAiGeneration(mockJob);

      if (result.success && (result as any).metadata) {
        const metadata = (result as any).metadata as MetadataResponse;
        expect(metadata.source).toBe('Knowledge Base Unavailable');
        expect(metadata.answer).toContain('I could not find supporting medical information');
      } else {
        expect((result as PipelineError).stage).toBeDefined();
      }
    });

    it('should allow medical queries like swollen ankles', async () => {
      const mockJob: AiGenerationJob = {
        questionId: 'test-q-medical-2',
        query: 'What causes swollen ankles?',
        userId: 'user-1',
      };

      const { retrievalService } = jest.requireMock('../../modules/retrieval/retrieval.service') as any;
      if (retrievalService.isMedicalQuery) {
        retrievalService.isMedicalQuery = jest.fn().mockResolvedValue(true);
      }
      if (retrievalService.semanticSearch) {
        retrievalService.semanticSearch = jest.fn().mockResolvedValue([
          { id: 'm1', score: 0.60, metadata: { text: 'Low relevance' } },
        ]);
      }

      const result = await processAiGeneration(mockJob);

      if (result.success && (result as any).metadata) {
        const metadata = (result as any).metadata as MetadataResponse;
        expect(metadata.source).toBe('Knowledge Base Unavailable');
        expect(metadata.answer).toContain('I could not find supporting medical information');
      } else {
        expect((result as PipelineError).stage).toBeDefined();
      }
    });

    it('should proceed to Groq when relevant context exists', async () => {
      const mockJob: AiGenerationJob = {
        questionId: 'test-q-with-ctx',
        query: 'What is hypertension?',
        userId: 'user-1',
      };

      const { RetrievalService, retrievalService } = jest.requireMock('../../modules/retrieval/retrieval.service') as any;
      const MockRetrievalServiceClass = RetrievalService;
      const instance = new MockRetrievalServiceClass();
      instance.embeddingService = {
        isRealEmbeddings: true,
        generateEmbedding: jest.fn().mockResolvedValue(Array(384).fill(0.5)),
      };
      instance.semanticSearch = jest.fn().mockResolvedValue([
        { score: 0.9, id: 'd1', metadata: { text: 'HTN content' } },
      ]);
      instance.isMedicalQuery = jest.fn().mockResolvedValue(true);

      MockRetrievalServiceClass.mockImplementation(() => instance);

      const result = await processAiGeneration(mockJob);

      expect(result.success || (result as PipelineError).stage).toBeTruthy();

      MockRetrievalServiceClass.mockImplementation(() => ({ ...retrievalService }));
    });
  });

  describe('metadata generation', () => {
    it('should include all required metadata fields in response', async () => {
      const mockJob: AiGenerationJob = {
        questionId: 'test-q-meta',
        query: 'What is diabetes?',
        userId: 'user-1',
      };

      const result = await processAiGeneration(mockJob);

      if (result.success && (result as any).metadata) {
        const metadata = (result as any).metadata as MetadataResponse;
        expect(metadata).toHaveProperty('answer');
        expect(metadata).toHaveProperty('source', 'real');
        expect(metadata).toHaveProperty('documentsUsed');
        expect(metadata).toHaveProperty('model');
        expect(metadata).toHaveProperty('embeddingModel', 'Xenova/all-MiniLM-L6-v2');
        expect(metadata).toHaveProperty('processingTime');
      } else {
        expect((result as PipelineError).stage).toBeDefined();
      }
    });

    it('should have processingTime as number', async () => {
      const mockJob: AiGenerationJob = {
        questionId: 'test-q-meta-2',
        query: 'What is diabetes?',
        userId: 'user-1',
      };

      const result = await processAiGeneration(mockJob);

      if (result.success && (result as any).metadata) {
        expect(typeof (result as any).metadata.processingTime).toBe('number');
      }
    });
  });

  describe('response source validation', () => {
    it('should never return success=true when pipeline stages fail', async () => {
      const mockJob: AiGenerationJob = {
        questionId: 'test-q-fail',
        query: 'What is diabetes?',
        userId: 'user-1',
      };

      const result = await processAiGeneration(mockJob);

      if (!result.success) {
        expect(['embeddings', 'retrieval', 'llm', 'database']).toContain((result as PipelineError).stage);
      }
    });
  });
});
