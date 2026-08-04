"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const redis_1 = require("../../lib/redis");
const email_processor_1 = require("../processors/email.processor");
const logger_1 = require("../../config/logger");
const worker = new bullmq_1.Worker('email', async (job) => {
    logger_1.logger.info(`Processing email job: ${job.id}`);
    return (0, email_processor_1.processEmail)(job.data);
}, {
    connection: redis_1.redis,
    concurrency: 5,
    removeOnComplete: { age: 3600 },
    removeOnFail: { age: 86400 },
});
worker.on('completed', (job) => {
    logger_1.logger.info(`Email job completed: ${job.id}`);
});
worker.on('failed', (job, err) => {
    logger_1.logger.error(`Email job failed: ${job?.id}`, err);
});
exports.default = worker;
//# sourceMappingURL=email.worker.js.map