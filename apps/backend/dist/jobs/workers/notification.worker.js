"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const redis_1 = require("../../lib/redis");
const notification_processor_1 = require("../processors/notification.processor");
const logger_1 = require("../../config/logger");
const worker = new bullmq_1.Worker('notifications', async (job) => {
    logger_1.logger.info(`Processing notification job: ${job.id}`);
    return (0, notification_processor_1.processNotification)(job.data);
}, {
    connection: redis_1.redis,
    concurrency: 10,
    removeOnComplete: { age: 3600 },
    removeOnFail: { age: 86400 },
});
worker.on('completed', (job) => {
    logger_1.logger.info(`Notification job completed: ${job.id}`);
});
worker.on('failed', (job, err) => {
    logger_1.logger.error(`Notification job failed: ${job?.id}`, err);
});
exports.default = worker;
//# sourceMappingURL=notification.worker.js.map