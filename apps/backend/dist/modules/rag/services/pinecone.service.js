"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PineconeService = void 0;
const pinecone_1 = require("@pinecone-database/pinecone");
const env_1 = require("../../../config/env");
class PineconeService {
    constructor() {
        this.pinecone = new pinecone_1.Pinecone({ apiKey: env_1.CONFIG.PINECONE_API_KEY });
        this.index = this.pinecone.index(env_1.CONFIG.PINECONE_INDEX_NAME);
    }
    async upsertVectors(vectors) {
        const batchSize = 100;
        for (let i = 0; i < vectors.length; i += batchSize) {
            const batch = vectors.slice(i, i + batchSize);
            await this.index.upsert(batch);
        }
    }
    async query(vector, topK = 10, filter) {
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
        const queryEmbedding = await embeddingService.generateEmbedding(query);
        return this.query(queryEmbedding, topK, filter);
    }
}
exports.PineconeService = PineconeService;
//# sourceMappingURL=pinecone.service.js.map