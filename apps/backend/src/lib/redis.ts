import Redis from 'ioredis';
import { CONFIG } from '../config/env';

const redis = new Redis(CONFIG.REDIS_URL as string);

export { redis };