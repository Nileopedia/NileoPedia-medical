import { documentQueue, aiQueue } from '../../jobs/queues';
import { DocumentIngestionJob } from '../../jobs/types';

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