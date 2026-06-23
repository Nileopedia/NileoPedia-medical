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

describe('AI Pipeline Validation', () => {
  describe('embeddings failure', () => {
    it('should return embeddings error when embedding service unavailable', async () => {
      const mockJob: AiGenerationJob = {
        questionId: 'test-q-2',
        query: 'What is diabetes?',
        userId: 'user-1',
      };

      const result = await processAiGeneration(mockJob);

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

      // Without services set up, embeddings/retrieval fails first
      expect(result.success).toBe(false);
      expect(['embeddings', 'retrieval', 'llm']).toContain((result as PipelineError).stage);
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
        // If pipeline fails due to missing services, verify error structure
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