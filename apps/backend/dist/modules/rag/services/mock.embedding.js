"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockEmbeddingProvider = void 0;
class MockEmbeddingProvider {
    constructor() {
        this.embeddingSource = 'mock';
        this.EXPECTED_DIMENSIONS = 384;
    }
    async generateEmbedding(text) {
        const hash = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const embedding = new Array(this.EXPECTED_DIMENSIONS).fill(0).map((_, i) => {
            const seed = (hash * (i + 1)) % 1000;
            return (seed - 500) / 500;
        });
        return embedding;
    }
    async generateBatchEmbeddings(texts) {
        return Promise.all(texts.map((t) => this.generateEmbedding(t)));
    }
}
exports.MockEmbeddingProvider = MockEmbeddingProvider;
//# sourceMappingURL=mock.embedding.js.map