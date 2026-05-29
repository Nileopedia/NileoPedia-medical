"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmbeddingService = void 0;
const openai_1 = require("openai");
const env_1 = require("../../../config/env");
class EmbeddingService {
    constructor() {
        this.openai = new openai_1.OpenAI({ apiKey: env_1.CONFIG.OPENAI_API_KEY });
    }
    async generateEmbedding(text) {
        const response = await this.openai.embeddings.create({
            model: 'text-embedding-3-large',
            input: text,
        });
        return response.data[0].embedding;
    }
    async generateBatchEmbeddings(texts) {
        const response = await this.openai.embeddings.create({
            model: 'text-embedding-3-large',
            input: texts,
        });
        return response.data.map((item) => item.embedding);
    }
    async preprocessText(text) {
        // Remove excessive whitespace
        let cleaned = text.replace(/\s+/g, ' ').trim();
        // Remove broken OCR patterns (common artifacts)
        cleaned = cleaned.replace(/[^\x00-\x7F]/g, '');
        return cleaned;
    }
}
exports.EmbeddingService = EmbeddingService;
//# sourceMappingURL=embedding.service.js.map