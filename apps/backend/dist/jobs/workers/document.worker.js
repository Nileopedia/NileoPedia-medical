"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const redis_1 = require("../../lib/redis");
const document_processor_1 = require("../processors/document.processor");
const logger_1 = require("../../config/logger");
const worker = new bullmq_1.Worker('document-ingestion', async (job) => {
    logger_1.logger.info(`Processing document ingestion job: ${job.id}`);
    return (0, document_processor_1.processDocumentIngestion)(job.data);
}, {
    connection: redis_1.redis,
    concurrency: 2,
    removeOnComplete: { age: 3600 },
    removeOnFail: { age: 86400 },
});
worker.on('completed', (job) => {
    logger_1.logger.info(`Document ingestion job completed: ${job.id}`);
});
worker.on('failed', (job, err) => {
    logger_1.logger.error(`Document ingestion job failed: ${job?.id}`, err);
});
worker.on('error', (err) => {
    logger_1.logger.error('Document worker error', err);
});
exports.default = worker;
//# sourceMappingURL=document.worker.js.map