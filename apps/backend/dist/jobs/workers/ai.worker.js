"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const redis_1 = require("../../lib/redis");
const ai_processor_1 = require("../processors/ai.processor");
const logger_1 = require("../../config/logger");
const worker = new bullmq_1.Worker('ai-generation', async (job) => {
    logger_1.logger.info(`Processing AI generation job: ${job.id}`);
    return (0, ai_processor_1.processAiGeneration)(job.data);
}, {
    connection: redis_1.redis,
    concurrency: 3,
    removeOnComplete: { age: 3600 },
    removeOnFail: { age: 86400 },
});
worker.on('completed', (job) => {
    logger_1.logger.info(`AI generation job completed: ${job.id}`);
});
worker.on('failed', (job, err) => {
    logger_1.logger.error(`AI generation job failed: ${job?.id}`, err);
});
worker.on('error', (err) => {
    logger_1.logger.error('AI worker error', err);
});
exports.default = worker;
//# sourceMappingURL=ai.worker.js.map