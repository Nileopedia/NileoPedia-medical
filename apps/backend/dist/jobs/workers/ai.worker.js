"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const redis_1 = require("../../lib/redis");
const ai_processor_1 = require("../processors/ai.processor");
const logger_1 = require("../../config/logger");
const prisma_1 = __importDefault(require("../../config/prisma"));
const worker = new bullmq_1.Worker('ai-generation', async (job) => {
    logger_1.logger.info(`Processing AI generation job: ${job.id}`);
    return (0, ai_processor_1.processAiGeneration)(job.data);
}, {
    connection: redis_1.redis,
    concurrency: 3,
    removeOnComplete: { age: 3600 },
    removeOnFail: { age: 86400 },
});
async function storeErrorAndEmit(questionId, errorMessage) {
    try {
        await prisma_1.default.aIResponse.upsert({
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
    }
    catch (dbError) {
        logger_1.logger.error('Failed to store error response:', dbError);
    }
    if (global.io) {
        global.io.to(`question-${questionId}`).emit('ai-error', {
            error: errorMessage,
        });
    }
}
worker.on('completed', async (job, result) => {
    logger_1.logger.info(`AI generation job completed: ${job.id}`);
    if (result && !result.success) {
        const pipelineError = result;
        const errorMessage = pipelineError.message || 'AI processing failed';
        await storeErrorAndEmit(job.data.questionId, errorMessage);
    }
    else if (result && result.success) {
        if (global.io) {
            global.io.to(`question-${job.data.questionId}`).emit('ai-response-complete', {});
        }
    }
});
worker.on('failed', async (job, err) => {
    logger_1.logger.error(`AI generation job failed: ${job?.id}`, err);
    if (job) {
        const errorMessage = err?.message || 'AI processing failed';
        await storeErrorAndEmit(job.data.questionId, errorMessage);
    }
});
worker.on('error', (err) => {
    logger_1.logger.error('AI worker error', err);
});
exports.default = worker;
//# sourceMappingURL=ai.worker.js.map