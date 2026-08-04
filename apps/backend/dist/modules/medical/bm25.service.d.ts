export interface Bm25Result {
    chunkId: string;
    documentId: string;
    score: number;
    text: string;
    title?: string;
    metadata: Record<string, any>;
}
export interface Bm25Stats {
    totalDocuments: number;
    totalChunks: number;
    averageDocumentLength: number;
    vocabularySize: number;
}
export declare class Bm25Service {
    private readonly k1;
    private readonly b;
    private documentLengths;
    private averageDocumentLength;
    private invertedIndex;
    private documentTermFrequencies;
    private totalDocuments;
    private initialized;
    initialize(): Promise<void>;
    search(query: string, topK?: number, filter?: Record<string, any>): Promise<Bm25Result[]>;
    private enrichResults;
    private tokenize;
    private isStopWord;
    getStats(): Promise<Bm25Stats>;
    reindex(): Promise<void>;
}
export declare const bm25Service: Bm25Service;
//# sourceMappingURL=bm25.service.d.ts.map