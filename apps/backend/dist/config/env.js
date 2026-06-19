"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONFIG = void 0;
const dotenv_1 = require("dotenv");
// Load environment variables from .env
(0, dotenv_1.config)();
// Load environment variables from .env.${NODE_ENV} to override
const env = process.env.NODE_ENV || 'development';
(0, dotenv_1.config)({ path: `.env.${env}` });
exports.CONFIG = {
    PORT: parseInt(process.env.PORT || '3001', 10),
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
    // Groq (for chat completions)
    GROQ_API_KEY: process.env.GROQ_API_KEY || '',
    GROQ_MODEL: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
    // Hugging Face (for embeddings)
    HF_API_KEY: process.env.HF_API_KEY || '',
    HF_EMBEDDING_MODEL: process.env.HF_EMBEDDING_MODEL || 'sentence-transformers/all-MiniLM-L6-v2',
    // Redis
    REDIS_URL: process.env.REDIS_URL || '',
    // AI Service
    AI_SERVICE_URL: process.env.AI_SERVICE_URL || 'http://localhost:8000',
    // CORS
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
    // Frontend
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
    // Google OAuth
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
    GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/v1/auth/google/callback',
    GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/api/v1/auth/google/callback',
    // Rate Limiting
    RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    // File Upload
    MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10),
    UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',
    // Mock AI mode
    USE_MOCK_AI: process.env.USE_MOCK_AI === 'true' || process.env.NODE_ENV === 'test',
    // Mock Embeddings mode  
    USE_MOCK_EMBEDDINGS: process.env.USE_MOCK_EMBEDDINGS === 'true' || process.env.NODE_ENV === 'test',
    // Scheduled Ingestion
    SCHEDULED_INGESTION_ENABLED: process.env.SCHEDULED_INGESTION_ENABLED ?? 'true',
};
//# sourceMappingURL=env.js.map