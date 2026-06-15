export interface DocumentChunk {
    text: string;
    chunkIndex: number;
    metadata: Record<string, any>;
}
export declare class ChunkingService {
    private embeddingService;
    constructor();
    chunkDocument(content: string, metadata?: Record<string, any>): DocumentChunk[];
    generateEmbeddings(chunks: DocumentChunk[]): Promise<Array<{
        embedding: number[];
        chunk: DocumentChunk;
    }>>;
}
//# sourceMappingURL=chunking.service.d.ts.map