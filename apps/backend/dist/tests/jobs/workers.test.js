"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const queues_1 = require("../../jobs/queues");
describe('Worker Queues', () => {
    describe('document-ingestion queue', () => {
        it('should be defined', () => {
            expect(queues_1.documentQueue).toBeDefined();
            expect(queues_1.documentQueue.name).toBe('document-ingestion');
        });
        it('should add jobs with default options', async () => {
            const jobData = {
                documentId: 'test-doc-id',
                fileUrl: '/uploads/test.pdf',
                fileType: 'application/pdf',
                fileName: 'test.pdf',
                title: 'Test Document',
                uploadedById: 'user-test-id',
            };
            const job = await queues_1.documentQueue.add('ingest', jobData);
            expect(job).toBeDefined();
            expect(job.name).toBe('ingest');
            expect(job.data).toEqual(jobData);
            expect(job.opts.attempts).toBe(3);
        });
    });
    describe('ai-generation queue', () => {
        it('should be defined', () => {
            expect(queues_1.aiQueue).toBeDefined();
            expect(queues_1.aiQueue.name).toBe('ai-generation');
        });
    });
});
describe('Document Processor', () => {
    it('should export processDocumentIngestion function', () => {
        const { processDocumentIngestion } = require('../../jobs/processors/document.processor');
        expect(typeof processDocumentIngestion).toBe('function');
    });
});
//# sourceMappingURL=workers.test.js.map