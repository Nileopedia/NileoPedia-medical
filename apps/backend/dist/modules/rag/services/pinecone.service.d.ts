import { DocumentChunk } from './chunking.service';
export declare class PineconeService {
    private pinecone;
    private index;
    constructor();
    upsertVectors(vectors: Array<{
        id: string;
        values: number[];
        metadata?: Record<string, any>;
    }>): Promise<void>;
    query(vector: number[], topK?: number, filter?: Record<string, any>): Promise<any>;
    deleteVectors(ids: string[]): Promise<void>;
    deleteByDocumentId(documentId: string): Promise<void>;
    storeChunks(chunks: DocumentChunk[], embeddings: number[][], documentId: string): Promise<{
        id: string;
        values: number[];
        metadata: {
            documentId: string;
            chunkIndex: number;
            textPreview: string;
        };
    }[]>;
    searchSimilar(query: string, embeddingService: any, topK?: number, filter?: Record<string, any>): Promise<any>;
    describeIndexStats(): Promise<any>;
}
//# sourceMappingURL=pinecone.service.d.ts.map