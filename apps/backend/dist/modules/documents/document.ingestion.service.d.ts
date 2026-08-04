export declare class DocumentIngestionService {
    private embeddingService;
    private chunkingService;
    private pineconeService;
    private qualityValidationService;
    constructor();
    ingestDocument(input: {
        title: string;
        description?: string;
        source?: string;
        content: string;
        publicationYear?: number;
        specialty?: string;
        documentType?: string;
        uploadedById?: string;
        fileName: string;
        fileUrl: string;
        fileType: string;
        fileSize: number;
    }): Promise<{
        document: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            ingestionStatus: import("@prisma/client").$Enums.IngestionStatus;
            title: string;
            description: string | null;
            fileName: string;
            fileUrl: string;
            fileType: string;
            fileSize: number;
            specialty: string | null;
            documentType: string | null;
            source: string | null;
            publicationYear: number | null;
            uploadedById: string | null;
            isVerified: boolean;
        };
        chunksCount: number;
    }>;
    ingestContentForDocument(documentId: string, content: string, meta: {
        title?: string;
        source?: string;
        specialty?: string;
        documentType?: string;
        publicationYear?: number;
    }): Promise<{
        document: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            ingestionStatus: import("@prisma/client").$Enums.IngestionStatus;
            title: string;
            description: string | null;
            fileName: string;
            fileUrl: string;
            fileType: string;
            fileSize: number;
            specialty: string | null;
            documentType: string | null;
            source: string | null;
            publicationYear: number | null;
            uploadedById: string | null;
            isVerified: boolean;
        };
        chunksCount: number;
    }>;
    private buildChunkEnrichedMetadata;
}
//# sourceMappingURL=document.ingestion.service.d.ts.map