"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscriber = exports.redis = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const env_1 = require("../config/env");
let redis;
let subscriber;
try {
    exports.redis = redis = new ioredis_1.default(env_1.CONFIG.REDIS_URL, {
        maxRetriesPerRequest: null,
        connectTimeout: 2000,
        lazyConnect: true,
    });
    exports.subscriber = subscriber = new ioredis_1.default(env_1.CONFIG.REDIS_URL, {
        maxRetriesPerRequest: null,
        connectTimeout: 2000,
        lazyConnect: true,
    });
}
catch {
    // Redis unavailable - will be handled in subscriber setup
    exports.redis = redis = {};
    exports.subscriber = subscriber = {};
}
subscriber.subscribe('ai-progress', (err) => {
    if (err) {
        console.error('Failed to subscribe to ai-progress:', err);
    }
});
subscriber.on('message', (channel, message) => {
    if (channel === 'ai-progress' && global.io) {
        try {
            const data = JSON.parse(message);
            const { questionId, ...payload } = data;
            global.io.to(`question-${questionId}`).emit('ai-key-findings', payload);
        }
        catch (error) {
            console.error('Failed to parse progress message:', error);
        }
    }
});
//# sourceMappingURL=redis.js.map