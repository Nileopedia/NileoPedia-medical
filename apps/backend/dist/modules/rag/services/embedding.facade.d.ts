import { EmbeddingService } from './services/embedding.service';
export interface EmbeddingProvider {
    generateEmbedding(text: string): Promise<number[]>;
    generateBatchEmbeddings?(texts: string[]): Promise<number[][]>;
    embeddingSource: string;
}
export declare class EmbeddingService {
    private provider;
    static create(config?: {
        useMock?: boolean;
        useLocal?: boolean;
    }): EmbeddingService;
    constructor(config?: {
        useMock?: boolean;
        useLocal?: boolean;
    });
    get isRealEmbeddings(): boolean;
    get embeddingSource(): string;
    generateEmbedding(text: string): Promise<number[]>;
    generateBatchEmbeddings(texts: string[]): Promise<number[][]>;
    preprocessText(text: string): Promise<string>;
}
//# sourceMappingURL=embedding.facade.d.ts.map