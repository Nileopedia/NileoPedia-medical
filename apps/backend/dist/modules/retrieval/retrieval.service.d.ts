import { Pinecone } from '@pinecone-database/pinecone';
export declare class RetrievalService {
    private pinecone;
    private index;
    private embeddingService;
    get pineconeClient(): Pinecone | null;
    constructor();
    semanticSearch(query: string, topK?: number): Promise<any>;
    private getMockResults;
    hybridSearch(query: string, specialty?: string): Promise<any[]>;
    private rankResults;
}
//# sourceMappingURL=retrieval.service.d.ts.map