import { Pinecone } from '@pinecone-database/pinecone';
import { EmbeddingService } from '../rag/services/embedding.service';
export declare class RetrievalService {
    private pinecone;
    private index;
    embeddingService: EmbeddingService;
    private medicalReferenceEmbedding;
    get pineconeClient(): Pinecone | null;
    constructor();
    private initMedicalReferenceEmbedding;
    semanticSearch(query: string, topK?: number): Promise<any>;
    hybridSearch(query: string, specialty?: string): Promise<any[]>;
    private rankResults;
    isMedicalQuery(query: string, embeddingService: EmbeddingService): Promise<boolean>;
}
//# sourceMappingURL=retrieval.service.d.ts.map