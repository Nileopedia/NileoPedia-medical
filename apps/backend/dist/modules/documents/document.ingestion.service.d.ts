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
            ingestionStatus: import("@prisma/client").$Enums.IngestionStatus;
            documentType: string | null;
            publicationYear: number | null;
            description: string | null;
            title: string;
            id: string;
            fileName: string;
            fileUrl: string;
            fileType: string;
            fileSize: number;
            specialty: string | null;
            source: string | null;
            uploadedById: string;
            isVerified: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        chunksCount: number;
    }>;
}
//# sourceMappingURL=document.ingestion.service.d.ts.map