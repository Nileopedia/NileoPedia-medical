import { Worker } from 'bullmq';
import { redis } from '../../lib/redis';
import { processCleanup } from '../processors/cleanup.processor';
import { CleanupJob } from '../types';
import { logger } from '../../config/logger';

const worker = new Worker<CleanupJob>(
  'cleanup',
  async (job) => {
    logger.info(`Processing cleanup job: ${job.id}`);
    return processCleanup(job.data);
  },
  {
    connection: redis as any,
    concurrency: 1,
    removeOnComplete: { age: 86400 },
    removeOnFail: { age: 86400 },
  },
);

worker.on('completed', (job) => {
  logger.info(`Cleanup job completed: ${job.id}`);
});

worker.on('failed', (job, err) => {
  logger.error(`Cleanup job failed: ${job?.id}`, err);
});

export default worker;
