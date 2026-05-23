import { config as dotenvConfig } from 'dotenv';

// Load environment variables based on NODE_ENV
const env = process.env.NODE_ENV || 'development';
dotenvConfig({ path: `.env.${env}` });

// If file doesn't exist, fall back to .env
if (env !== 'development') {
  dotenvConfig({ path: '.env' });
}

export const CONFIG = {
  PORT: parseInt(process.env.PORT || '3000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Database
  DATABASE_URL: process.env.DATABASE_URL || '',
  
  // JWT
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || '',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || '',
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  
  // Pinecone
  PINECONE_API_KEY: process.env.PINECONE_API_KEY || '',
  PINECONE_ENVIRONMENT: process.env.PINECONE_ENVIRONMENT || '',
  PINECONE_INDEX_NAME: process.env.PINECONE_INDEX_NAME || 'nileopedia-medical',
  
  // OpenAI
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4o',
  
  // Redis
  REDIS_URL: process.env.REDIS_URL || '',
  
  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  
  // File Upload
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
  UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',
} as const;

export type Config = typeof CONFIG;