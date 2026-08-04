export interface RerankResult {
    id: string;
    score: number;
    originalScore: number;
    metadata: Record<string, any>;
    text?: string;
    rank: number;
}
export declare class CrossEncoderReranker {
    private pineconeService;
    private embeddingService;
    constructor();
    rerank(query: string, candidates: Array<{
        id: string;
        score: number;
        metadata: Record<string, any>;
        text?: string;
    }>, topK?: number): Promise<RerankResult[]>;
    private computeLengthNormalization;
    private computeCosineSimilarity;
}
export declare const crossEncoderReranker: CrossEncoderReranker;
//# sourceMappingURL=cross-encoder-reranker.service.d.ts.map