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
            uploadedById: string;
            ingestionStatus: import("@prisma/client").$Enums.IngestionStatus;
            isVerified: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        chunksCount: number;
    }>;
}
//# sourceMappingURL=document.ingestion.service.d.ts.map