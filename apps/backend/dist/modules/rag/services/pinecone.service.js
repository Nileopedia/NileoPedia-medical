"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PineconeService = void 0;
const pinecone_1 = require("@pinecone-database/pinecone");
const env_1 = require("../../../config/env");
const logger_1 = require("../../../config/logger");
const USE_MOCK_AI = process.env.USE_MOCK_AI === 'true' || !process.env.PINECONE_API_KEY;
class PineconeService {
    constructor() {
        this.pinecone = null;
        if (!USE_MOCK_AI && env_1.CONFIG.PINECONE_API_KEY) {
            this.pinecone = new pinecone_1.Pinecone({ apiKey: env_1.CONFIG.PINECONE_API_KEY });
            this.index = this.pinecone.index(env_1.CONFIG.PINECONE_INDEX_NAME);
        }
        else {
            logger_1.logger.info('Using mock search mode (Pinecone not configured)');
        }
    }
    async upsertVectors(vectors) {
        if (!this.pinecone || !this.index)
            return;
        const batchSize = 20;
        console.log('[PINECONE] Upserting', vectors.length, 'vectors');
        for (let i = 0; i < vectors.length; i += batchSize) {
            const batch = vectors.slice(i, i + batchSize);
            try {
                await this.index.upsert(batch);
            }
            catch (error) {
                logger_1.logger.error('Pinecone upsert batch failed:', { batchStart: i, error });
            }
        }
        console.log('[PINECONE] Upsert complete');
    }
    async query(vector, topK = 10, filter) {
        if (!this.pinecone || !this.index) {
            console.log('[PINECONE] Query skipped - Pinecone not configured');
            return [];
        }
        const queryRequest = {
            vector,
            topK,
            includeMetadata: true,
            ...(filter && { filter }),
        };
        const results = await this.index.query(queryRequest);
        const matches = results.matches || [];
        console.log('[PINECONE] Query returned', matches.length, 'matches, scores:', matches.map((m) => m.score));
        return matches;
    }
    async deleteVectors(ids) {
        if (!this.pinecone || !this.index)
            return;
        await this.index.deleteMany(ids);
    }
    async deleteByDocumentId(documentId) {
        if (!this.pinecone || !this.index)
            return;
        logger_1.logger.info('Deleting previous vectors', { documentId });
        try {
            await this.index.deleteMany({
                filter: { documentId },
            });
            logger_1.logger.info(`Deleted vectors for document ${documentId}`);
        }
        catch (error) {
            logger_1.logger.error('Failed deleting existing vectors', error);
            throw error;
        }
    }
    async storeChunks(chunks, embeddings, documentId) {
        console.log('[PINECONE] Storing', chunks.length, 'chunks for document:', documentId);
        const vectors = embeddings.map((embedding, i) => ({
            id: `${documentId}_chunk_${i}`,
            values: embedding,
            metadata: {
                documentId,
                chunkIndex: chunks[i].chunkIndex,
                textPreview: chunks[i].text.substring(0, 100),
                ...chunks[i].metadata,
            },
        }));
        await this.upsertVectors(vectors);
        console.log('[PINECONE] Stored', vectors.length, 'vectors for document:', documentId);
        return vectors;
    }
    async searchSimilar(query, embeddingService, topK = 10, filter) {
        if (!this.pinecone || !this.index) {
            console.log('[PINECONE] searchSimilar skipped - Pinecone not configured');
            return [];
        }
        const queryEmbedding = await embeddingService.generateEmbedding(query);
        return this.query(queryEmbedding, topK, filter);
    }
    async describeIndexStats() {
        if (!this.pinecone || !this.index)
            return null;
        try {
            const stats = await this.index.describeIndexStats();
            return stats;
        }
        catch (error) {
            logger_1.logger.error('Failed to describe index stats:', error);
            return null;
        }
    }
}
exports.PineconeService = PineconeService;
//# sourceMappingURL=pinecone.service.js.map