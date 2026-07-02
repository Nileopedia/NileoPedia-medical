import { Worker } from 'bullmq';
import { redis } from '../../lib/redis';
import { processDocumentIngestion } from '../processors/document.processor';
import { DocumentIngestionJob } from '../types';
import { logger } from '../../config/logger';

const worker = new Worker<DocumentIngestionJob>(
  'document-ingestion',
  async (job) => {
    logger.info(`Processing document ingestion job: ${job.id}`);
    return processDocumentIngestion(job.data);
  },
  {
    connection: redis as any,
    concurrency: 2,
    removeOnComplete: { age: 3600 },
    removeOnFail: { age: 86400 },
  },
);

worker.on('completed', (job) => {
  logger.info(`Document ingestion job completed: ${job.id}`);
});

worker.on('failed', (job, err) => {
  logger.error(`Document ingestion job failed: ${job?.id}`, err);
});

worker.on('error', (err) => {
  logger.error('Document worker error', err);
});

export default worker;
