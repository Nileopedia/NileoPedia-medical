"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiQueue = exports.cleanupQueue = exports.auditQueue = exports.notificationQueue = exports.emailQueue = exports.embeddingQueue = exports.documentQueue = void 0;
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
const env_1 = require("../../config/env");
let connection = null;
let aiQueueInstance = null;
try {
    connection = new ioredis_1.default(env_1.CONFIG.REDIS_URL, {
        maxRetriesPerRequest: null,
        connectTimeout: 2000,
        lazyConnect: true,
    });
}
catch {
    // Redis unavailable
}
const createQueue = (name) => {
    if (!connection) {
        return null;
    }
    return new bullmq_1.Queue(name, {
        connection: connection,
        defaultJobOptions: {
            attempts: 3,
            backoff: { type: 'exponential', delay: 2000 },
            removeOnFail: { age: 86400 },
            removeOnComplete: { age: 3600 },
        },
    });
};
exports.documentQueue = createQueue('document-ingestion');
exports.embeddingQueue = createQueue('embeddings');
exports.emailQueue = createQueue('email');
exports.notificationQueue = createQueue('notifications');
exports.auditQueue = createQueue('audit');
exports.cleanupQueue = createQueue('cleanup');
exports.aiQueue = createQueue('ai-generation');
//# sourceMappingURL=index.js.map