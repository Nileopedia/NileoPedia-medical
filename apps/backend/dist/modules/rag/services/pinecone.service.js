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
        const batchSize = 20; // Smaller batch size to avoid Pinecone timeouts
        for (let i = 0; i < vectors.length; i += batchSize) {
            const batch = vectors.slice(i, i + batchSize);
            try {
                await this.index.upsert(batch);
            }
            catch (error) {
                logger_1.logger.error('Pinecone upsert batch failed:', { batchStart: i, error });
            }
        }
    }
    async query(vector, topK = 10, filter) {
        if (!this.pinecone || !this.index) {
            return [];
        }
        const queryRequest = {
            vector,
            topK,
            includeMetadata: true,
            ...(filter && { filter }),
        };
        const results = await this.index.query(queryRequest);
        return results.matches || [];
    }
    async deleteVectors(ids) {
        if (!this.pinecone || !this.index)
            return;
        await this.index.delete(ids);
    }
    async storeChunks(chunks, embeddings, documentId) {
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
        return vectors;
    }
    async searchSimilar(query, embeddingService, topK = 10, filter) {
        if (!this.pinecone || !this.index) {
            return [];
        }
        const queryEmbedding = await embeddingService.generateEmbedding(query);
        return this.query(queryEmbedding, topK, filter);
    }
}
exports.PineconeService = PineconeService;
//# sourceMappingURL=pinecone.service.js.map