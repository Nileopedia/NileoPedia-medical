import { Pinecone } from '@pinecone-database/pinecone';
import { EmbeddingService } from '../rag/services/embedding.service';
export declare class RetrievalService {
    private pinecone;
    private index;
    embeddingService: EmbeddingService;
    get pineconeClient(): Pinecone | null;
    constructor();
    semanticSearch(query: string, topK?: number): Promise<any>;
    hybridSearch(query: string, specialty?: string): Promise<any[]>;
    private rankResults;
}
//# sourceMappingURL=retrieval.service.d.ts.map