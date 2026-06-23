"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetrievalService = void 0;
const pinecone_1 = require("@pinecone-database/pinecone");
const env_1 = require("../../config/env");
const logger_1 = require("../../config/logger");
const embedding_service_1 = require("../rag/services/embedding.service");
class RetrievalService {
    get pineconeClient() {
        return this.pinecone;
    }
    constructor() {
        this.pinecone = null;
        this.index = null;
        this.embeddingService = new embedding_service_1.EmbeddingService();
        if (env_1.CONFIG.PINECONE_API_KEY && !env_1.CONFIG.USE_MOCK_EMBEDDINGS) {
            try {
                this.pinecone = new pinecone_1.Pinecone({ apiKey: env_1.CONFIG.PINECONE_API_KEY });
                this.index = this.pinecone.index(env_1.CONFIG.PINECONE_INDEX_NAME);
            }
            catch (e) {
                logger_1.logger.error('[ERROR] Pinecone unavailable');
            }
        }
    }
    async semanticSearch(query, topK = 10) {
        if (!this.index) {
            logger_1.logger.error('[ERROR] Pinecone unavailable');
            return [];
        }
        const embedding = await this.embeddingService.generateEmbedding(query);
        const results = await this.index.query({
            vector: embedding,
            topK,
            includeMetadata: true,
        });
        return results.matches || [];
    }
    async hybridSearch(query, specialty) {
        const pineconeResults = await this.semanticSearch(query);
        let results = pineconeResults;
        if (specialty) {
            const filtered = pineconeResults.filter((match) => {
                const metadata = match.metadata || {};
                return metadata.specialty === specialty.toLowerCase() || !metadata.specialty;
            });
            results = filtered.length > 0 ? filtered : pineconeResults;
        }
        return this.rankResults(results);
    }
    rankResults(results) {
        return results.sort((a, b) => (b.score || 0) - (a.score || 0));
    }
}
exports.RetrievalService = RetrievalService;
//# sourceMappingURL=retrieval.service.js.map