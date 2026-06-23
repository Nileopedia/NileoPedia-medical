export declare function preloadEmbeddingModel(): Promise<void>;
export declare class EmbeddingService {
    private mockMode;
    private useLocal;
    constructor();
    get isRealEmbeddings(): boolean;
    get embeddingSource(): string;
    generateEmbedding(text: string): Promise<number[]>;
    generateBatchEmbeddings(texts: string[]): Promise<number[][]>;
    preprocessText(text: string): Promise<string>;
}
//# sourceMappingURL=embedding.service.d.ts.map