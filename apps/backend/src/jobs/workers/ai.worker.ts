import { Worker } from 'bullmq';
import { redis } from '../../lib/redis';
import { processAiGeneration } from '../processors/ai.processor';
import { AiGenerationJob } from '../types';
import { logger } from '../../config/logger';

const worker = new Worker<AiGenerationJob>(
  'ai-generation',
  async (job) => {
    logger.info(`Processing AI generation job: ${job.id}`);
    return processAiGeneration(job.data);
  },
  {
    connection: redis as any,
    concurrency: 3,
    removeOnComplete: { age: 3600 },
    removeOnFail: { age: 86400 },
  },
);

worker.on('completed', (job) => {
  logger.info(`AI generation job completed: ${job.id}`);
});

worker.on('failed', (job, err) => {
  logger.error(`AI generation job failed: ${job?.id}`, err);
});

worker.on('error', (err) => {
  logger.error('AI worker error', err);
});

export default worker;
