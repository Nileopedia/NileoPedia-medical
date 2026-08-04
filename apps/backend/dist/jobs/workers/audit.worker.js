"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const redis_1 = require("../../lib/redis");
const audit_processor_1 = require("../processors/audit.processor");
const logger_1 = require("../../config/logger");
const worker = new bullmq_1.Worker('audit', async (job) => {
    logger_1.logger.info(`Processing audit job: ${job.id}`);
    return (0, audit_processor_1.processAudit)(job.data);
}, {
    connection: redis_1.redis,
    concurrency: 5,
    removeOnComplete: { age: 3600 },
    removeOnFail: { age: 86400 },
});
worker.on('completed', (job) => {
    logger_1.logger.info(`Audit job completed: ${job.id}`);
});
worker.on('failed', (job, err) => {
    logger_1.logger.error(`Audit job failed: ${job?.id}`, err);
});
exports.default = worker;
//# sourceMappingURL=audit.worker.js.map