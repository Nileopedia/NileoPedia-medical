"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const redis_1 = require("../../lib/redis");
const cleanup_processor_1 = require("../processors/cleanup.processor");
const logger_1 = require("../../config/logger");
const worker = new bullmq_1.Worker('cleanup', async (job) => {
    logger_1.logger.info(`Processing cleanup job: ${job.id}`);
    return (0, cleanup_processor_1.processCleanup)(job.data);
}, {
    connection: redis_1.redis,
    concurrency: 1,
    removeOnComplete: { age: 86400 },
    removeOnFail: { age: 86400 },
});
worker.on('completed', (job) => {
    logger_1.logger.info(`Cleanup job completed: ${job.id}`);
});
worker.on('failed', (job, err) => {
    logger_1.logger.error(`Cleanup job failed: ${job?.id}`, err);
});
exports.default = worker;
//# sourceMappingURL=cleanup.worker.js.map