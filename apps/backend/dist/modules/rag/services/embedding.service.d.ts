export declare class EmbeddingService {
    constructor();
    generateEmbedding(text: string): Promise<number[]>;
    generateBatchEmbeddings(texts: string[]): Promise<number[][]>;
    private generateMockEmbedding;
    preprocessText(text: string): Promise<string>;
}
//# sourceMappingURL=embedding.service.d.ts.map