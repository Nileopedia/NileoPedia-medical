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
        if (!this.index)
            return [];
        const results = await this.index.query({
            vector: embedding,
            topK,
            includeMetadata: true,
        });
        return results.matches || [];
    }
    async generateEmbedding(text) {
        // Call the ai-service for real embeddings
        const axios = require('axios');
        try {
            const response = await axios.post(`${env_1.CONFIG.AI_SERVICE_URL}/embeddings/`, { text }, { timeout: 30000 });
            return response.data.embedding || [];
        }
        catch (error) {
            console.error('Embedding generation failed:', error);
            return [];
        }
    }
    async hybridSearch(query, specialty) {
        const pineconeResults = await this.semanticSearch(query);
        // Filter by specialty if provided
        let results = pineconeResults;
        if (specialty && this.index) {
            const filtered = [];
            for (const match of pineconeResults) {
                const metadata = match.metadata || {};
                if (metadata.specialty === specialty.toLowerCase() || !metadata.specialty) {
                    filtered.push(match);
                }
            }
            results = filtered;
        }
        return this.rankResults(results);
    }
    rankResults(results) {
        return results.sort((a, b) => (b.score || 0) - (a.score || 0));
    }
}
exports.RetrievalService = RetrievalService;
//# sourceMappingURL=retrieval.service.js.map