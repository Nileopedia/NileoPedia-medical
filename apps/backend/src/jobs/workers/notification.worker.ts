import { Worker } from 'bullmq';
import { redis } from '../../lib/redis';
import { processNotification } from '../processors/notification.processor';
import { NotificationJob } from '../types';
import { logger } from '../../config/logger';

const worker = new Worker<NotificationJob>(
  'notifications',
  async (job) => {
    logger.info(`Processing notification job: ${job.id}`);
    return processNotification(job.data);
  },
  {
    connection: redis as any,
    concurrency: 10,
    removeOnComplete: { age: 3600 },
    removeOnFail: { age: 86400 },
  },
);

worker.on('completed', (job) => {
  logger.info(`Notification job completed: ${job.id}`);
});

worker.on('failed', (job, err) => {
  logger.error(`Notification job failed: ${job?.id}`, err);
});

export default worker;
