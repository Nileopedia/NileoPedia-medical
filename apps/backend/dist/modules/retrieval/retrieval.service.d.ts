import { Pinecone } from '@pinecone-database/pinecone';
export declare class RetrievalService {
    private pinecone;
    private index;
    get pineconeClient(): Pinecone | null;
    constructor();
    semanticSearch(query: string, topK?: number): Promise<any>;
    generateEmbedding(text: string): Promise<number[]>;
    hybridSearch(query: string): Promise<any[]>;
    private rankResults;
}
//# sourceMappingURL=retrieval.service.d.ts.map