/// <reference types="jest" />
interface MockEmbeddingService {
    generateEmbedding: jest.Mock;
    generateBatchEmbeddings: jest.Mock;
    preprocessText: jest.Mock;
    isRealEmbeddings: boolean;
    embeddingSource: string;
}
declare const mockEmbeddingService: MockEmbeddingService;
//# sourceMappingURL=embedding.test.d.ts.map