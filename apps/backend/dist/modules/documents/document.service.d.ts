import { IngestionStatus } from '@prisma/client';
import { CreateDocumentDto, UpdateDocumentDto, GetDocumentsQuery, GetDocumentsResult } from './document.types';
export declare class DocumentService {
    getAllDocuments(query: GetDocumentsQuery): Promise<GetDocumentsResult>;
    getDocumentById(id: string): Promise<({
        embeddingMetadata: {
            id: string;
            createdAt: Date;
            documentId: string;
            pineconeVectorId: string;
            chunkIndex: number;
            chunkText: string;
        }[];
    } & {
        specialty: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        source: string | null;
        publicationYear: number | null;
        documentType: string | null;
        description: string | null;
        fileName: string;
        fileUrl: string;
        fileType: string;
        fileSize: number;
        uploadedById: string;
        ingestionStatus: import("@prisma/client").$Enums.IngestionStatus;
        isVerified: boolean;
    }) | null>;
    createDocument(data: CreateDocumentDto): Promise<{
        specialty: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        source: string | null;
        publicationYear: number | null;
        documentType: string | null;
        description: string | null;
        fileName: string;
        fileUrl: string;
        fileType: string;
        fileSize: number;
        uploadedById: string;
        ingestionStatus: import("@prisma/client").$Enums.IngestionStatus;
        isVerified: boolean;
    }>;
    updateDocument(id: string, data: UpdateDocumentDto): Promise<{
        specialty: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        source: string | null;
        publicationYear: number | null;
        documentType: string | null;
        description: string | null;
        fileName: string;
        fileUrl: string;
        fileType: string;
        fileSize: number;
        uploadedById: string;
        ingestionStatus: import("@prisma/client").$Enums.IngestionStatus;
        isVerified: boolean;
    }>;
    deleteDocument(id: string): Promise<{
        specialty: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        source: string | null;
        publicationYear: number | null;
        documentType: string | null;
        description: string | null;
        fileName: string;
        fileUrl: string;
        fileType: string;
        fileSize: number;
        uploadedById: string;
        ingestionStatus: import("@prisma/client").$Enums.IngestionStatus;
        isVerified: boolean;
    }>;
    verifyDocument(id: string): Promise<{
        specialty: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        source: string | null;
        publicationYear: number | null;
        documentType: string | null;
        description: string | null;
        fileName: string;
        fileUrl: string;
        fileType: string;
        fileSize: number;
        uploadedById: string;
        ingestionStatus: import("@prisma/client").$Enums.IngestionStatus;
        isVerified: boolean;
    } | null>;
    updateIngestionStatus(id: string, status: IngestionStatus): Promise<{
        specialty: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        source: string | null;
        publicationYear: number | null;
        documentType: string | null;
        description: string | null;
        fileName: string;
        fileUrl: string;
        fileType: string;
        fileSize: number;
        uploadedById: string;
        ingestionStatus: import("@prisma/client").$Enums.IngestionStatus;
        isVerified: boolean;
    }>;
    getIngestionStatus(id: string): Promise<{
        documentId: string;
        ingestionStatus: import("@prisma/client").$Enums.IngestionStatus;
        chunksProcessed: number;
        vectorsStored: number;
    }>;
}
//# sourceMappingURL=document.service.d.ts.map