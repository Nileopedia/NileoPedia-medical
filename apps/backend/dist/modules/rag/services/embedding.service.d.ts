export declare class EmbeddingService {
    private openai;
    constructor();
    generateEmbedding(text: string): Promise<number[]>;
    generateBatchEmbeddings(texts: string[]): Promise<number[][]>;
    preprocessText(text: string): Promise<string>;
}
//# sourceMappingURL=embedding.service.d.ts.map