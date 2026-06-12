import Redis from 'ioredis';
import { CONFIG } from '../config/env';

let redis: Redis;
let subscriber: Redis;

try {
  redis = new Redis(CONFIG.REDIS_URL as string, {
    maxRetriesPerRequest: null,
    connectTimeout: 2000,
    lazyConnect: true,
  });
  subscriber = new Redis(CONFIG.REDIS_URL as string, {
    maxRetriesPerRequest: null,
    connectTimeout: 2000,
    lazyConnect: true,
  });
} catch {
  // Redis unavailable - will be handled in subscriber setup
  redis = {} as Redis;
  subscriber = {} as Redis;
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
    } catch (error) {
      console.error('Failed to parse progress message:', error);
    }
  }
});

export { redis, subscriber };