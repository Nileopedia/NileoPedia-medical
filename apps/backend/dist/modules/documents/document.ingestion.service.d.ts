export declare class DocumentIngestionService {
    private embeddingService;
    private chunkingService;
    private pineconeService;
    constructor();
    ingestDocument(input: {
        title: string;
        description?: string;
        source?: string;
        content: string;
        publicationYear?: number;
        specialty?: string;
        documentType?: string;
        uploadedById: string;
        fileName: string;
        fileUrl: string;
        fileType: string;
        fileSize: number;
    }): Promise<{
        document: {
            id: string;
            createdAt: Date;
            specialty: string | null;
            updatedAt: Date;
            source: string | null;
            publicationYear: number | null;
            title: string;
            description: string | null;
            fileName: string;
            fileUrl: string;
            fileType: string;
            fileSize: number;
            documentType: string | null;
            uploadedById: string;
            ingestionStatus: import("@prisma/client").$Enums.IngestionStatus;
            isVerified: boolean;
        };
        chunksCount: number;
    }>;
}
//# sourceMappingURL=document.ingestion.service.d.ts.map