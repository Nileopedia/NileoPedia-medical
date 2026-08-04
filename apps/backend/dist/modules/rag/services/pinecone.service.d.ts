import { DocumentChunk } from './chunking.service';
interface MockVector {
    id: string;
    values: number[];
    metadata?: Record<string, any>;
}
export declare class PineconeService {
    private pinecone;
    private index;
    private isAvailable;
    static mockVectors: MockVector[];
    constructor();
    isMockMode(): boolean;
    pineconeClient(): this;
    upsertVectors(vectors: Array<{
        id: string;
        values: number[];
        metadata?: Record<string, any>;
    }>): Promise<{
        success: number;
        failed: number;
    }>;
    query(vector: number[], topK?: number, filter?: Record<string, any>): Promise<any>;
    deleteVectors(ids: string[]): Promise<void>;
    deleteByDocumentId(documentId: string): Promise<void>;
    storeChunks(chunks: DocumentChunk[], embeddings: number[][], documentId: string, enrichedMetadata?: Record<string, any>): Promise<{
        vectors: {
            id: string;
            values: number[];
            metadata: Record<string, any>;
        }[];
        result: {
            success: number;
            failed: number;
        };
    }>;
    searchSimilar(query: string, embeddingService: any, topK?: number, filter?: Record<string, any>): Promise<any>;
    describeIndexStats(): Promise<any>;
    validateIndex(expectedDimension?: number): Promise<{
        valid: boolean;
        dimension?: number;
        error?: string;
    }>;
}
export {};
//# sourceMappingURL=pinecone.service.d.ts.map