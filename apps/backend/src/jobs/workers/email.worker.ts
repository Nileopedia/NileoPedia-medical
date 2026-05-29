import { Worker } from 'bullmq';
import { redis } from '../../lib/redis';
import { processEmail } from '../processors/email.processor';
import { EmailJob } from '../types';
import { logger } from '../../config/logger';

const worker = new Worker<EmailJob>(
  'email',
  async (job) => {
    logger.info(`Processing email job: ${job.id}`);
    return processEmail(job.data);
  },
  {
    connection: redis as any,
    concurrency: 5,
    removeOnComplete: { age: 3600 },
    removeOnFail: { age: 86400 },
  }
);

worker.on('completed', (job) => {
  logger.info(`Email job completed: ${job.id}`);
});

worker.on('failed', (job, err) => {
  logger.error(`Email job failed: ${job?.id}`, err);
});

export default worker;