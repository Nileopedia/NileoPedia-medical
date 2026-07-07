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
        this.medicalReferenceEmbedding = null;
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
        this.initMedicalReferenceEmbedding();
    }
    async initMedicalReferenceEmbedding() {
        try {
            this.medicalReferenceEmbedding = await this.embeddingService.generateEmbedding('disease symptoms diagnosis treatment medication malaria hypertension diabetes cancer infection patient medicine healthcare clinical care fever headache asthma pneumonia');
        }
        catch (e) {
            logger_1.logger.error('[ERROR] Failed to generate medical reference embedding:', e);
            this.medicalReferenceEmbedding = null;
        }
    }
    async semanticSearch(query, topK = 10) {
        if (!this.index) {
            logger_1.logger.error('[ERROR] Pinecone unavailable');
            return [];
        }
        const embedding = await this.embeddingService.generateEmbedding(query);
        console.log('[PINECONE] Query embedding dimensions:', embedding.length);
        const results = await this.index.query({
            vector: embedding,
            topK,
            includeMetadata: true,
        });
        console.log('[PINECONE] Matches:', results.matches?.length);
        console.log('[PINECONE] Scores:', results.matches?.map((m) => m.score));
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
    async isMedicalQuery(query, embeddingService) {
        const medicalTerms = [
            'malaria',
            'hypertension',
            'diabetes',
            'asthma',
            'pneumonia',
            'stroke',
            'cancer',
            'fever',
            'headache',
            'infection',
            'tuberculosis',
            'covid',
            'heart',
            'blood pressure',
            'pain',
            'symptoms',
            'diagnosis',
            'treatment',
            'medication',
            'disease',
            'patient',
        ];
        const normalized = query.toLowerCase().trim();
        const containsMedicalTerm = medicalTerms.some((term) => normalized.includes(term));
        if (containsMedicalTerm) {
            console.log({ query: normalized, containsMedicalTerm: true, similarity: 'term-match' });
            return true;
        }
        const queryEmbedding = await embeddingService.generateEmbedding(normalized);
        let similarity = 0;
        if (this.medicalReferenceEmbedding) {
            similarity = cosineSimilarity(queryEmbedding, this.medicalReferenceEmbedding);
        }
        console.log({ query: normalized, containsMedicalTerm: false, similarity });
        return similarity >= 0.30;
    }
}
exports.RetrievalService = RetrievalService;
function cosineSimilarity(a, b) {
    if (a.length !== b.length) {
        throw new Error('Embedding dimensions must match');
    }
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    if (denominator === 0) {
        return 0;
    }
    return dotProduct / denominator;
}
//# sourceMappingURL=retrieval.service.js.map