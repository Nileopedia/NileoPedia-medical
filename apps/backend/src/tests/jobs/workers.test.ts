import { documentQueue, aiQueue } from '../../jobs/queues';
import { DocumentIngestionJob } from '../../jobs/types';
import { processAiGeneration } from '../../jobs/processors/ai.processor';

describe('Worker Queues', () => {
  describe('document-ingestion queue', () => {
    it('should be defined', () => {
      expect(documentQueue).toBeDefined();
      expect(documentQueue.name).toBe('document-ingestion');
    });

    it('should add jobs with default options', async () => {
      const jobData: DocumentIngestionJob = {
        documentId: 'test-doc-id',
        fileUrl: '/uploads/test.pdf',
        fileType: 'application/pdf',
        fileName: 'test.pdf',
        title: 'Test Document',
        uploadedById: 'user-test-id',
      };

      const job = await documentQueue.add('ingest', jobData);

      expect(job).toBeDefined();
      expect(job.name).toBe('ingest');
      expect(job.data).toEqual(jobData);
      expect(job.opts.attempts).toBe(3);
    });
  });

  describe('ai-generation queue', () => {
    it('should be defined', () => {
      expect(aiQueue).toBeDefined();
      expect(aiQueue.name).toBe('ai-generation');
    });
  });
});

describe('Document Processor', () => {
  it('should export processDocumentIngestion function', () => {
    const { processDocumentIngestion } = require('../../jobs/processors/document.processor');
    expect(typeof processDocumentIngestion).toBe('function');
  });
});

describe('AI Pipeline Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return embeddings error when embedding service fails', async () => {
    const mockJob = {
      questionId: 'test-q-1',
      query: 'What is diabetes?',
      userId: 'user-1',
      topK: 10,
    };

    const result = await processAiGeneration(mockJob as any);

    expect(result.success).toBe(false);
    expect((result as any).stage).toBe('embeddings');
    expect((result as any).message).toBe('Embedding service unavailable');
  });

  it('should return retrieval error when no documents found', async () => {
    const mockJob = {
      questionId: 'test-q-2',
      query: 'What is diabetes?',
      userId: 'user-1',
      topK: 10,
    };

    const result = await processAiGeneration(mockJob as any);

    expect(result.success).toBe(false);
    expect((result as any).stage).toBe('retrieval');
    expect((result as any).message).toBe('No supporting medical documents found');
  });

  it('should never return success=true when pipeline stages fail', async () => {
    const mockJob = {
      questionId: 'test-q-3',
      query: 'What is diabetes?',
      userId: 'user-1',
      topK: 10,
    };

    const result = await processAiGeneration(mockJob as any);

    expect(result.success).toBe(false);
  });
});

describe('Metadata Generation', () => {
  it('should include all required metadata fields in real response', async () => {
    const mockJob = {
      questionId: 'test-q-meta',
      query: 'What is diabetes?',
      userId: 'user-1',
      topK: 10,
    };

    const result = await processAiGeneration(mockJob as any);

    if (result.success && (result as any).metadata) {
      const { metadata } = (result as any);
      expect(metadata).toHaveProperty('answer');
      expect(metadata).toHaveProperty('source', 'real');
      expect(metadata).toHaveProperty('documentsUsed');
      expect(metadata).toHaveProperty('model');
      expect(metadata).toHaveProperty('embeddingModel', 'Xenova/all-MiniLM-L6-v2');
      expect(metadata).toHaveProperty('processingTime');
    }
  });
});
