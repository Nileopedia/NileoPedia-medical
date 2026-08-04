"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.crossEncoderReranker = exports.CrossEncoderReranker = void 0;
const pinecone_service_1 = require("../rag/services/pinecone.service");
const embedding_service_1 = require("../rag/services/embedding.service");
class CrossEncoderReranker {
    constructor() {
        this.pineconeService = new pinecone_service_1.PineconeService();
        this.embeddingService = new embedding_service_1.EmbeddingService();
    }
    async rerank(query, candidates, topK = 6) {
        if (candidates.length === 0) {
            return [];
        }
        try {
            const queryEmbedding = await this.embeddingService.generateEmbedding(query);
            const scoredCandidates = await Promise.all(candidates.map(async (candidate) => {
                const candidateText = candidate.metadata?.text || candidate.metadata?.textPreview || candidate.text || '';
                const candidateEmbedding = await this.embeddingService.generateEmbedding(candidateText.substring(0, 1000));
                const cosineSim = this.computeCosineSimilarity(queryEmbedding, candidateEmbedding);
                const textLength = candidateText.length;
                const lengthNormalization = this.computeLengthNormalization(textLength);
                const combinedScore = cosineSim * 0.6 + lengthNormalization * 0.4;
                const finalScore = combinedScore * 0.7 + candidate.score * 0.3;
                return {
                    id: candidate.id,
                    score: finalScore,
                    originalScore: candidate.score,
                    metadata: candidate.metadata,
                    text: candidateText,
                };
            }));
            const ranked = scoredCandidates
                .sort((a, b) => b.score - a.score)
                .slice(0, topK)
                .map((item, index) => ({ ...item, rank: index + 1 }));
            return ranked;
        }
        catch (error) {
            console.error('Cross-encoder reranking failed:', error);
            return candidates
                .slice(0, topK)
                .sort((a, b) => b.score - a.score)
                .map((item, index) => ({ ...item, rank: index + 1, originalScore: item.score }));
        }
    }
    computeLengthNormalization(length) {
        const optimalMin = 300;
        const optimalMax = 800;
        if (length >= optimalMin && length <= optimalMax) {
            return 1.0;
        }
        if (length < optimalMin) {
            return Math.max(0, length / optimalMin);
        }
        return Math.max(0, 1 - (length - optimalMax) / (optimalMax * 2));
    }
    computeCosineSimilarity(a, b) {
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
        if (denominator === 0)
            return 0;
        return dotProduct / denominator;
    }
}
exports.CrossEncoderReranker = CrossEncoderReranker;
exports.crossEncoderReranker = new CrossEncoderReranker();
//# sourceMappingURL=cross-encoder-reranker.service.js.map