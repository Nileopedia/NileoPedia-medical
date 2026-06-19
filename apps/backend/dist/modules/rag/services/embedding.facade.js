"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmbeddingService = void 0;
const embedding_service_1 = require("./services/embedding.service");
const mock_embedding_1 = require("./services/mock.embedding");
const local_embedding_1 = require("./services/local.embedding");
const hf_embedding_1 = require("./services/hf.embedding");
class EmbeddingService {
    static create(config) {
        return new embedding_service_1.EmbeddingService(config);
    }
    constructor(config) {
        // In test environment, always use mock
        if (process.env.NODE_ENV === 'test' || config?.useMock) {
            this.provider = new mock_embedding_1.MockEmbeddingProvider();
        }
        else if (config?.useLocal) {
            this.provider = new local_embedding_1.LocalEmbeddingProvider();
        }
        else {
            this.provider = new hf_embedding_1.HFEmbeddingProvider();
        }
    }
    get isRealEmbeddings() {
        return this.provider.embeddingSource !== 'mock';
    }
    get embeddingSource() {
        return this.provider.embeddingSource;
    }
    async generateEmbedding(text) {
        return this.provider.generateEmbedding(text);
    }
    async generateBatchEmbeddings(texts) {
        return this.provider.generateBatchEmbeddings?.(texts) ?? texts.map(t => this.generateEmbedding(t));
    }
    async preprocessText(text) {
        return text.replace(/\s+/g, ' ').trim().replace(/[^\x00-\x7F]/g, '');
    }
}
exports.EmbeddingService = EmbeddingService;
//# sourceMappingURL=embedding.facade.js.map