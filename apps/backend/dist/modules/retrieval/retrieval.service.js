"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetrievalService = void 0;
const pinecone_1 = require("@pinecone-database/pinecone");
const env_1 = require("../../config/env");
class RetrievalService {
    get pineconeClient() {
        return this.pinecone;
    }
    constructor() {
        this.pinecone = null;
        this.index = null;
        if (env_1.CONFIG.PINECONE_API_KEY) {
            this.pinecone = new pinecone_1.Pinecone({ apiKey: env_1.CONFIG.PINECONE_API_KEY });
            this.index = this.pinecone.index(env_1.CONFIG.PINECONE_INDEX_NAME);
        }
    }
    async semanticSearch(query, topK = 10) {
        const embedding = await this.generateEmbedding(query);
        const results = await this.index.query({
            vector: embedding,
            topK,
            includeMetadata: true,
        });
        return results.matches || [];
    }
    async generateEmbedding(text) {
        return Array(1536).fill(0).map(() => Math.random());
    }
    async hybridSearch(query) {
        const semanticResults = await this.semanticSearch(query);
        return this.rankResults(semanticResults);
    }
    rankResults(results) {
        return results.sort((a, b) => (b.score || 0) - (a.score || 0));
    }
}
exports.RetrievalService = RetrievalService;
//# sourceMappingURL=retrieval.service.js.map