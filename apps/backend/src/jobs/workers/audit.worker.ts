import { Worker } from 'bullmq';
import { redis } from '../../lib/redis';
import { processAudit } from '../processors/audit.processor';
import { AuditJob } from '../types';
import { logger } from '../../config/logger';

const worker = new Worker<AuditJob>(
  'audit',
  async (job) => {
    logger.info(`Processing audit job: ${job.id}`);
    return processAudit(job.data);
  },
  {
    connection: redis as any,
    concurrency: 5,
    removeOnComplete: { age: 3600 },
    removeOnFail: { age: 86400 },
  },
);

worker.on('completed', (job) => {
  logger.info(`Audit job completed: ${job.id}`);
});

worker.on('failed', (job, err) => {
  logger.error(`Audit job failed: ${job?.id}`, err);
});

export default worker;
