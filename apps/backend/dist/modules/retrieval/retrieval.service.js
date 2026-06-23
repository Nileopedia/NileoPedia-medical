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
                logger_1.logger.warn('Pinecone initialization failed, using mock mode');
            }
        }
        else {
            logger_1.logger.info('Using mock search mode');
        }
    }
    async semanticSearch(query, topK = 10) {
        if (!this.index) {
            return this.getMockResults(query, topK);
        }
        try {
            const embedding = await this.embeddingService.generateEmbedding(query);
            const results = await this.index.query({
                vector: embedding,
                topK,
                includeMetadata: true,
            });
            return results.matches || [];
        }
        catch (error) {
            logger_1.logger.warn('Pinecone query failed, using mock results:', error);
            return this.getMockResults(query, topK);
        }
    }
    getMockResults(query, topK = 10) {
        const demoChunks = [
            { id: 'mock-1', score: 0.95, metadata: { documentId: 'demo-doc-1', textPreview: `Medical guideline for ${query}: Evidence-based recommendation`, specialty: 'general' } },
            { id: 'mock-2', score: 0.88, metadata: { documentId: 'demo-doc-2', textPreview: `Clinical study: ${query} treatment protocols`, specialty: 'general' } },
            { id: 'mock-3', score: 0.82, metadata: { documentId: 'demo-doc-3', textPreview: `Research findings: ${query} outcomes`, specialty: 'cardiology' } },
        ];
        return demoChunks.slice(0, topK);
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