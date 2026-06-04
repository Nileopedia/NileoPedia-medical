import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { CONFIG } from '../../config/env';

const connection = new Redis(CONFIG.REDIS_URL as string, {
  maxRetriesPerRequest: null,
});

const createQueue = (name: string) => {
  return new Queue(name, { 
    connection: connection as any,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnFail: { age: 86400 },
      removeOnComplete: { age: 3600 },
    },
  });
};

export const documentQueue = createQueue('document-ingestion');
export const embeddingQueue = createQueue('embeddings');
export const emailQueue = createQueue('email');
export const notificationQueue = createQueue('notifications');
export const auditQueue = createQueue('audit');
export const cleanupQueue = createQueue('cleanup');
export const aiQueue = createQueue('ai-generation');