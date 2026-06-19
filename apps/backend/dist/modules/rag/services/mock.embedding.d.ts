export declare class MockEmbeddingProvider {
    embeddingSource: string;
    private EXPECTED_DIMENSIONS;
    generateEmbedding(text: string): Promise<number[]>;
    generateBatchEmbeddings(texts: string[]): Promise<number[][]>;
}
//# sourceMappingURL=mock.embedding.d.ts.map