import { Worker } from 'bullmq';
import { redis } from '../../lib/redis';
import { processAiGeneration } from '../processors/ai.processor';
import { AiGenerationJob, PipelineError } from '../types';
import { logger } from '../../config/logger';
import prisma from '../../config/prisma';

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

async function storeErrorAndEmit(questionId: string, errorMessage: string): Promise<void> {
  try {
    await prisma.aIResponse.upsert({
      where: { questionId },
      create: {
        questionId,
        summary: errorMessage,
        detailedExplanation: JSON.stringify({
          clinicalSummary: errorMessage,
        }),
        keyFindings: [],
        confidenceScore: 0,
        generatedBy: 'Pipeline Error',
        validationStatus: 'APPROVED',
      },
      update: {
        questionId,
        summary: errorMessage,
        detailedExplanation: JSON.stringify({
          clinicalSummary: errorMessage,
        }),
        keyFindings: [],
        confidenceScore: 0,
        generatedBy: 'Pipeline Error',
        validationStatus: 'APPROVED',
      },
    });
  } catch (dbError) {
    logger.error('Failed to store error response:', dbError);
  }

  if (global.io) {
    global.io.to(`question-${questionId}`).emit('ai-error', {
      error: errorMessage,
    });
  }
}

worker.on('completed', async (job, result) => {
  logger.info(`AI generation job completed: ${job.id}`);

  if (result && !result.success) {
    const pipelineError = result as PipelineError;
    const errorMessage = pipelineError.message || 'AI processing failed';
    await storeErrorAndEmit(job.data.questionId, errorMessage);
  } else if (result && result.success) {
    if (global.io) {
      global.io.to(`question-${job.data.questionId}`).emit('ai-response-complete', {});
    }
  }
});

worker.on('failed', async (job, err) => {
  logger.error(`AI generation job failed: ${job?.id}`, err);
  if (job) {
    const errorMessage = err?.message || 'AI processing failed';
    await storeErrorAndEmit(job.data.questionId, errorMessage);
  }
});

worker.on('error', (err) => {
  logger.error('AI worker error', err);
});

export default worker;
