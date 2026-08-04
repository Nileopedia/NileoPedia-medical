import { PineconeService } from '../rag/services/pinecone.service';
import { EmbeddingService } from '../rag/services/embedding.service';
export interface RetrievalMatch {
    id: string;
    score: number;
    metadata: Record<string, any>;
    text?: string;
    retrievalSource?: 'dense' | 'keyword' | 'hybrid';
}
export declare class RetrievalService {
    private pineconeService;
    embeddingService: EmbeddingService;
    private medicalReferenceEmbedding;
    private synonymService;
    private bm25Service;
    private dynamicRetrievalService;
    private acronymResolver;
    private crossEncoderReranker;
    private spellCheckService;
    constructor();
    private initMedicalReferenceEmbedding;
    isMockMode(): boolean;
    get pineconeClient(): PineconeService | {
        index: () => {
            query: () => Promise<{
                matches: never[];
            }>;
        };
    };
    semanticSearch(query: string, topK?: number): Promise<RetrievalMatch[]>;
    hybridSearch(query: string, specialty?: string, topK?: number): Promise<RetrievalMatch[]>;
    private bm25Search;
    private mergeResults;
    private deduplicateResults;
    private rerankResults;
    private hashText;
    buildContext(matches: any[]): string;
    getRetrievalStats(matches: any[]): {
        totalCount: number;
        avgLength: number;
        duplicateCount: number;
        metadataCompleteness: number;
    };
    isMedicalQuery(query: string, embeddingService: EmbeddingService): Promise<boolean>;
}
//# sourceMappingURL=retrieval.service.d.ts.map