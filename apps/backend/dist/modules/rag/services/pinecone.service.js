"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PineconeService = void 0;
const pinecone_1 = require("@pinecone-database/pinecone");
const env_1 = require("../../../config/env");
const logger_1 = require("../../../config/logger");
const mockVectors = [];
function cosineSimilarity(a, b) {
    if (a.length !== b.length)
        return 0;
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator === 0 ? 0 : dotProduct / denominator;
}
async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
    let lastError;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await fn();
        }
        catch (error) {
            lastError = error;
            const errorMessage = error?.message || error?.toString?.() || 'Unknown error';
            const isRetryable = errorMessage.includes('Request failed to reach Pinecone') ||
                errorMessage.includes('ECONNRESET') ||
                errorMessage.includes('ETIMEDOUT') ||
                errorMessage.includes('rate limit') ||
                errorMessage.includes('429') ||
                errorMessage.includes('500') ||
                errorMessage.includes('503');
            if (!isRetryable || attempt === maxRetries - 1) {
                throw error;
            }
            const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
            console.log(`[PINECONE] Retry ${attempt + 1}/${maxRetries} after ${Math.round(delay)}ms: ${errorMessage}`);
            await sleep(delay);
        }
    }
    throw lastError;
}
class PineconeService {
    constructor() {
        this.pinecone = null;
        this.isAvailable = false;
        if (env_1.CONFIG.PINECONE_API_KEY) {
            try {
                this.pinecone = new pinecone_1.Pinecone({ apiKey: env_1.CONFIG.PINECONE_API_KEY });
                this.index = this.pinecone.index(env_1.CONFIG.PINECONE_INDEX_NAME);
                this.isAvailable = true;
            }
            catch (e) {
                logger_1.logger.error('Pinecone initialization failed, using mock mode:', e);
                this.isAvailable = false;
            }
        }
        if (!this.isAvailable) {
            logger_1.logger.info('Using mock vector search (Pinecone not available)');
        }
    }
    isMockMode() {
        return !this.isAvailable;
    }
    pineconeClient() {
        return this;
    }
    async upsertVectors(vectors) {
        if (this.isAvailable && this.index) {
            const batchSize = 20;
            console.log('[PINECONE] Upserting', vectors.length, 'vectors');
            let success = 0;
            let failed = 0;
            for (let i = 0; i < vectors.length; i += batchSize) {
                const batch = vectors.slice(i, i + batchSize);
                try {
                    await retryWithBackoff(async () => {
                        await this.index.upsert(batch);
                    });
                    success += batch.length;
                    if (i + batchSize < vectors.length) {
                        await sleep(500);
                    }
                }
                catch (error) {
                    const errorMessage = error?.message || error?.toString?.() || 'Unknown error';
                    const isConnError = errorMessage.includes('Request failed to reach Pinecone') ||
                        errorMessage.includes('ECONNRESET') || errorMessage.includes('ETIMEDOUT') ||
                        errorMessage.includes('fetch failed') || errorMessage.includes('Connect Timeout');
                    if (isConnError && this.isAvailable) {
                        logger_1.logger.warn('Pinecone connection failed during upsert, switching to mock mode');
                        this.isAvailable = false;
                        this.pinecone = null;
                        this.index = null;
                        PineconeService.mockVectors.push(...vectors.slice(i));
                        console.log('[MOCK] Stored', vectors.length - i, 'vectors (mock mode fallback), total:', PineconeService.mockVectors.length);
                        return { success: vectors.length, failed: 0 };
                    }
                    failed += batch.length;
                    const errorCode = error?.code || error?.status || error?.name || 'unknown';
                    const errorStack = error?.stack || '';
                    logger_1.logger.error('Pinecone upsert batch failed:', {
                        batchStart: i,
                        batchSize: batch.length,
                        errorMessage,
                        errorCode,
                        errorStack: errorStack ? errorStack.split('\n').slice(0, 3).join('\n') : undefined,
                    });
                    console.error(`[PINECONE] Upsert batch ${i}-${i + batch.length} failed: ${errorMessage} (${errorCode})`);
                }
            }
            console.log('[PINECONE] Upsert complete', { success, failed });
            return { success, failed };
        }
        else {
            PineconeService.mockVectors.push(...vectors);
            console.log('[MOCK] Stored', vectors.length, 'vectors (mock mode), total:', PineconeService.mockVectors.length);
            return { success: vectors.length, failed: 0 };
        }
    }
    async query(vector, topK = 10, filter) {
        if (this.isAvailable && this.index) {
            const queryRequest = {
                vector,
                topK,
                includeMetadata: true,
                ...(filter && { filter }),
            };
            try {
                const results = await retryWithBackoff(async () => {
                    return await this.index.query(queryRequest);
                });
                const matches = results.matches || [];
                console.log('[PINECONE] Query returned', matches.length, 'matches, scores:', matches.map((m) => m.score));
                return matches;
            }
            catch (error) {
                const errorMessage = error?.message || error?.toString?.() || 'Unknown error';
                const isConnError = errorMessage.includes('Request failed to reach Pinecone') ||
                    errorMessage.includes('ECONNRESET') || errorMessage.includes('ETIMEDOUT') ||
                    errorMessage.includes('fetch failed') || errorMessage.includes('Connect Timeout');
                if (isConnError) {
                    logger_1.logger.warn('Pinecone connection failed during query, switching to mock mode');
                    this.isAvailable = false;
                    this.pinecone = null;
                    this.index = null;
                }
                else {
                    throw error;
                }
            }
        }
        if (!PineconeService.mockVectors.length) {
            console.log('[MOCK] Query skipped - no vectors in mock store');
            return [];
        }
        const scored = PineconeService.mockVectors.map((v) => ({
            id: v.id,
            score: cosineSimilarity(vector, v.values),
            metadata: v.metadata,
        }));
        const filtered = filter
            ? scored.filter((m) => m.metadata && Object.keys(filter).every((k) => m.metadata?.[k] === filter[k]))
            : scored;
        const sorted = filtered.sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, topK);
        console.log('[MOCK] Query returned', sorted.length, 'matches, max score:', sorted[0]?.score);
        return sorted;
    }
    async deleteVectors(ids) {
        if (this.isAvailable && this.index) {
            await this.index.deleteMany(ids);
        }
        else {
            PineconeService.mockVectors = PineconeService.mockVectors.filter((v) => !ids.includes(v.id));
        }
    }
    async deleteByDocumentId(documentId) {
        if (this.isAvailable && this.index) {
            logger_1.logger.info('Deleting previous vectors', { documentId });
            try {
                await this.index.deleteMany({
                    filter: { documentId: { $eq: documentId } },
                });
                logger_1.logger.info(`Deleted vectors for document ${documentId}`);
            }
            catch (error) {
                logger_1.logger.error('Failed deleting existing vectors', error);
                throw error;
            }
        }
        else {
            const before = PineconeService.mockVectors.length;
            PineconeService.mockVectors = PineconeService.mockVectors.filter((v) => v.metadata?.documentId !== documentId);
            console.log(`[MOCK] Deleted ${before - PineconeService.mockVectors.length} vectors for document ${documentId}`);
        }
    }
    async storeChunks(chunks, embeddings, documentId, enrichedMetadata) {
        console.log('[PINECONE] Storing', chunks.length, 'chunks for document:', documentId);
        const vectors = embeddings.map((embedding, i) => {
            const metadata = {
                documentId,
                chunkIndex: chunks[i].chunkIndex,
                textPreview: chunks[i].text.substring(0, 100),
                text: chunks[i].text.substring(0, 8000),
            };
            for (const [key, value] of Object.entries(chunks[i].metadata)) {
                if (value !== null && value !== undefined) {
                    metadata[key] = value;
                }
            }
            if (enrichedMetadata) {
                for (const [key, value] of Object.entries(enrichedMetadata)) {
                    if (value !== null && value !== undefined && value !== '' && !(Array.isArray(value) && value.length === 0)) {
                        metadata[key] = value;
                    }
                }
            }
            return {
                id: `${documentId}_chunk_${i}`,
                values: embedding,
                metadata,
            };
        });
        const result = await this.upsertVectors(vectors);
        console.log('[PINECONE] Stored', result.success, 'of', vectors.length, 'vectors for document:', documentId);
        return { vectors, result };
    }
    async searchSimilar(query, embeddingService, topK = 10, filter) {
        const queryEmbedding = await embeddingService.generateEmbedding(query);
        return this.query(queryEmbedding, topK, filter);
    }
    async describeIndexStats() {
        if (this.isAvailable && this.index) {
            try {
                const stats = await this.index.describeIndexStats();
                return stats;
            }
            catch (error) {
                logger_1.logger.error('Failed to describe index stats:', error);
                return null;
            }
        }
        return { totalVectorCount: PineconeService.mockVectors.length, dimension: 384 };
    }
    async validateIndex(expectedDimension = 384) {
        if (!this.isAvailable || !this.index) {
            return { valid: false, error: 'Pinecone not available' };
        }
        try {
            const stats = await this.index.describeIndexStats();
            const dimension = stats.dimension;
            if (!dimension) {
                return { valid: false, error: 'Could not determine index dimension. Index may not exist or is not ready.' };
            }
            if (dimension !== expectedDimension) {
                return {
                    valid: false,
                    dimension,
                    error: `Index dimension mismatch: index has ${dimension}D but embedding model produces ${expectedDimension}D vectors`,
                };
            }
            return { valid: true, dimension };
        }
        catch (error) {
            const errorMessage = error?.message || error?.toString?.() || 'Unknown validation error';
            const notFound = /404|not found|does not exist/i.test(errorMessage);
            if (notFound && this.pinecone) {
                try {
                    logger_1.logger.info(`Pinecone index "${env_1.CONFIG.PINECONE_INDEX_NAME}" not found, creating...`);
                    await this.pinecone.createIndex({
                        name: env_1.CONFIG.PINECONE_INDEX_NAME,
                        dimension: expectedDimension,
                        metric: 'cosine',
                        spec: {
                            serverless: {
                                cloud: 'aws',
                                region: env_1.CONFIG.PINECONE_ENVIRONMENT,
                            },
                        },
                        suppressConflicts: true,
                        waitUntilReady: true,
                    });
                    this.index = this.pinecone.index(env_1.CONFIG.PINECONE_INDEX_NAME);
                    logger_1.logger.info(`Pinecone index "${env_1.CONFIG.PINECONE_INDEX_NAME}" created, re-validating...`);
                    const stats = await this.index.describeIndexStats();
                    const dimension = stats.dimension;
                    if (!dimension) {
                        return { valid: false, error: 'Could not determine index dimension after creation.' };
                    }
                    if (dimension !== expectedDimension) {
                        return {
                            valid: false,
                            dimension,
                            error: `Index dimension mismatch after creation: index has ${dimension}D but embedding model produces ${expectedDimension}D vectors`,
                        };
                    }
                    return { valid: true, dimension };
                }
                catch (createError) {
                    const createErrorMessage = createError?.message || createError?.toString?.() || 'Unknown creation error';
                    return { valid: false, error: `Index validation and creation failed: ${createErrorMessage}` };
                }
            }
            return { valid: false, error: `Index validation failed: ${errorMessage}` };
        }
    }
}
exports.PineconeService = PineconeService;
PineconeService.mockVectors = mockVectors;
//# sourceMappingURL=pinecone.service.js.map