export declare class DocumentIngestionService {
    private embeddingService;
    private chunkingService;
    private pineconeService;
    constructor();
    ingestDocument(input: {
        title: string;
        category?: string;
        source?: string;
        content: string;
        publicationYear?: number;
        specialty?: string;
        uploadedBy?: string;
    }): Promise<{
        document: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            source: string | null;
            title: string;
            category: string | null;
            content: string;
            uploadedBy: string | null;
            isVerified: boolean;
            version: number;
        };
        chunksCount: number;
    }>;
}
//# sourceMappingURL=document.ingestion.service.d.ts.map