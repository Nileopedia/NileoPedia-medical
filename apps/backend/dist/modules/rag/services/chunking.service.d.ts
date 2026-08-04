export interface DocumentChunk {
    text: string;
    chunkIndex: number;
    chunkId: string;
    metadata: Record<string, any>;
}
interface ChunkOptions {
    documentId?: string;
    title?: string;
    source?: string;
    specialty?: string;
    documentType?: string;
    publicationYear?: number;
    authors?: string[];
    journal?: string;
    publisher?: string;
    doi?: string;
    isbn?: string;
    pmid?: string;
    pmcid?: string;
    institution?: string;
    country?: string;
    keywords?: string[];
    language?: string;
    sourceURL?: string;
    pageNumber?: number;
}
export declare class ChunkingService {
    private embeddingService;
    constructor();
    chunkDocument(content: string, options?: ChunkOptions): DocumentChunk[];
    generateEmbeddings(chunks: DocumentChunk[]): Promise<Array<{
        embedding: number[];
        chunk: DocumentChunk;
    }>>;
    deduplicateChunks(chunks: DocumentChunk[], similarityThreshold?: number): Promise<DocumentChunk[]>;
}
export {};
//# sourceMappingURL=chunking.service.d.ts.map