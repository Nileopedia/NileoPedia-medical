"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmbeddingService = exports.preloadEmbeddingModel = void 0;
const env_1 = require("../../../config/env");
const logger_1 = require("../../../config/logger");
// Dynamic fetch import to support ES modules and CommonJS
let fetch;
async function getFetch() {
    if (!fetch) {
        fetch = (await Promise.resolve().then(() => __importStar(require('node-fetch')))).default || (await Promise.resolve().then(() => __importStar(require('node-fetch'))));
    }
    return fetch;
}
const { HF_API_KEY } = env_1.CONFIG;
const { HF_EMBEDDING_MODEL } = env_1.CONFIG;
const EXPECTED_DIMENSIONS = 384;
// Force mock mode in test environment to avoid network calls and dynamic imports
const IS_TEST = process.env.NODE_ENV === 'test';
const LOCAL_EMBEDDING_ENABLED = process.env.LOCAL_EMBEDDINGS !== 'false' && !IS_TEST;
// Log environment on module load
console.log('[EmbeddingService] Configuration check:', {
    HF_API_KEY_EXISTS: !!HF_API_KEY,
    HF_API_KEY_LENGTH: HF_API_KEY?.length || 0,
    HF_EMBEDDING_MODEL,
    USE_MOCK_EMBEDDINGS: env_1.CONFIG.USE_MOCK_EMBEDDINGS,
    LOCAL_EMBEDDINGS_ENABLED: LOCAL_EMBEDDING_ENABLED,
});
if (env_1.CONFIG.USE_MOCK_EMBEDDINGS) {
    console.warn('[EmbeddingService] WARNING: USE_MOCK_EMBEDDINGS=true - mock embeddings will be used');
}
// Local embedding using @xenova/transformers (lazy loaded)
let localEmbeddingPipeline = null;
async function loadLocalEmbedding() {
    if (!LOCAL_EMBEDDING_ENABLED)
        return null;
    if (localEmbeddingPipeline)
        return localEmbeddingPipeline;
    try {
        const { pipeline } = await Promise.resolve().then(() => __importStar(require('@xenova/transformers')));
        localEmbeddingPipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        console.log('[STARTUP] Embedding model loaded');
        return localEmbeddingPipeline;
    }
    catch (e) {
        console.error('[ERROR] Local embedding model unavailable:', e);
        return null;
    }
}
// Preload embedding model for startup warmup
async function preloadEmbeddingModel() {
    if (!LOCAL_EMBEDDING_ENABLED) {
        console.log('[STARTUP] Skipping embedding preload (local embeddings disabled)');
        return;
    }
    try {
        await loadLocalEmbedding();
    }
    catch (e) {
        console.error('[STARTUP] Failed to preload embedding model:', e);
    }
}
exports.preloadEmbeddingModel = preloadEmbeddingModel;
async function localEmbedding(text) {
    const pipeline = await loadLocalEmbedding();
    if (!pipeline) {
        logger_1.logger.error('[ERROR] Pinecone unavailable');
        throw new Error('Embedding service unavailable');
    }
    const output = await pipeline(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
}
async function hfEmbedding(text) {
    const requestUrl = `https://api-inference.huggingface.co/models/${HF_EMBEDDING_MODEL}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    try {
        console.log(`[HF] Requesting embedding from: ${requestUrl}`);
        const fetchFn = await getFetch();
        const response = await fetchFn(requestUrl, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${HF_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ inputs: text }),
            signal: controller.signal,
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HF API HTTP ${response.status}: ${response.statusText} - ${errorText}`);
        }
        const data = await response.json();
        const flatten = (arr) => arr.flat(Infinity);
        const embedding = flatten(data);
        // Validate dimensions
        if (embedding.length !== EXPECTED_DIMENSIONS) {
            throw new Error(`Unexpected embedding dimensions: ${embedding.length} (expected ${EXPECTED_DIMENSIONS})`);
        }
        console.log(`[HF] Generated embedding: ${embedding.length} dimensions`);
        return embedding;
    }
    catch (error) {
        // Detailed error logging
        if (error.name === 'AbortError') {
            console.error('[ERROR] Embedding service unavailable');
        }
        else if (error.message?.includes('fetch failed')) {
            console.error('[ERROR] Embedding service unavailable');
        }
        else if (error.message?.includes('401')) {
            console.error('[ERROR] Embedding service unavailable');
        }
        else {
            console.error('[ERROR] Embedding service unavailable:', error.message || error);
        }
        throw error;
    }
    finally {
        clearTimeout(timeoutId);
    }
}
class EmbeddingService {
    constructor() {
        this.useLocal = false;
        this.mockMode = IS_TEST || !HF_API_KEY && !LOCAL_EMBEDDING_ENABLED;
        if (this.mockMode) {
            logger_1.logger.warn('Using mock embeddings - no embedding service available');
            console.warn('[EmbeddingService] Mock embeddings active - 384 dimensions');
        }
        else if (LOCAL_EMBEDDING_ENABLED) {
            this.useLocal = true;
            logger_1.logger.info('Using local embeddings (Xenova/all-MiniLM-L6-v2)');
        }
        else {
            logger_1.logger.info(`Using Hugging Face embeddings: ${HF_EMBEDDING_MODEL}`);
        }
        logger_1.logger.info({
            localEnabled: env_1.CONFIG.LOCAL_EMBEDDINGS_ENABLED,
            hfConfigured: !!env_1.CONFIG.HF_API_KEY,
        });
    }
    get isRealEmbeddings() {
        return !this.mockMode;
    }
    get embeddingSource() {
        if (this.mockMode)
            return 'mock';
        if (this.useLocal)
            return 'local';
        return 'huggingface';
    }
    async generateEmbedding(text) {
        if (env_1.CONFIG.LOCAL_EMBEDDINGS_ENABLED) {
            try {
                logger_1.logger.info('Attempting local embeddings...');
                const localResult = await localEmbedding(text);
                logger_1.logger.info('Embedding source: local');
                return localResult;
            }
            catch (error) {
                logger_1.logger.warn('Local embedding failed, switching to HF API:', error);
            }
        }
        if (HF_API_KEY) {
            try {
                logger_1.logger.info('Attempting HF embeddings...');
                const hfResult = await hfEmbedding(text);
                logger_1.logger.info('Embedding source: huggingface');
                return hfResult;
            }
            catch (error) {
                logger_1.logger.warn('HF embedding failed:', error);
            }
        }
        logger_1.logger.error('No embedding provider available');
        throw new Error('Embedding service unavailable');
    }
    async generateBatchEmbeddings(texts) {
        if (this.mockMode) {
            throw new Error('Embedding service unavailable');
        }
        const results = [];
        for (const text of texts) {
            try {
                const embedding = await this.generateEmbedding(text);
                results.push(embedding);
            }
            catch (error) {
                logger_1.logger.error('Embedding failed for text:', {
                    error: error.message,
                    textPreview: text.substring(0, 30),
                });
                throw error;
            }
        }
        return results;
    }
    async preprocessText(text) {
        let cleaned = text.replace(/\s+/g, ' ').trim();
        cleaned = cleaned.replace(/[^\x00-\x7F]/g, '');
        return cleaned;
    }
}
exports.EmbeddingService = EmbeddingService;
//# sourceMappingURL=embedding.service.js.map