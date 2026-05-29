"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChunkingService = void 0;
const embedding_service_1 = require("./embedding.service");
class ChunkingService {
    constructor() {
        this.embeddingService = new embedding_service_1.EmbeddingService();
    }
    chunkDocument(content, metadata = {}) {
        // Semantic chunking based on paragraphs and sentences
        const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
        const chunks = [];
        for (let i = 0; i < paragraphs.length; i++) {
            const para = paragraphs[i];
            const sentences = para.split(/[.!?]+/).filter(s => s.trim().length > 50);
            for (const sentence of sentences) {
                const trimmed = sentence.trim();
                if (trimmed.length >= 50) {
                    chunks.push({
                        text: trimmed,
                        chunkIndex: chunks.length,
                        metadata: {
                            ...metadata,
                            source: metadata.source || 'unknown',
                            publicationYear: metadata.publicationYear,
                            specialty: metadata.specialty || 'general',
                        },
                    });
                }
            }
        }
        return chunks;
    }
    async generateEmbeddings(chunks) {
        const texts = chunks.map(c => c.text);
        const embeddings = await this.embeddingService.generateBatchEmbeddings(texts);
        return embeddings.map((embedding, i) => ({
            embedding,
            chunk: chunks[i],
        }));
    }
}
exports.ChunkingService = ChunkingService;
//# sourceMappingURL=chunking.service.js.map