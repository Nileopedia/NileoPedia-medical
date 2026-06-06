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
        uploadedById: string;
        fileName: string;
        fileUrl: string;
        fileType: string;
        fileSize: number;
    }): Promise<{
        document: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            description: string | null;
            source: string | null;
            publicationYear: number | null;
            documentType: string | null;
            specialty: string | null;
            fileName: string;
            fileUrl: string;
            fileType: string;
            fileSize: number;
            uploadedById: string;
            ingestionStatus: import("@prisma/client").$Enums.IngestionStatus;
            isVerified: boolean;
        };
        chunksCount: number;
    }>;
}
//# sourceMappingURL=document.ingestion.service.d.ts.map