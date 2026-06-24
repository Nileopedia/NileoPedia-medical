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
        id: string;
        createdAt: Date;
        updatedAt: Date;
        specialty: string | null;
        title: string;
        documentType: string | null;
        source: string | null;
        publicationYear: number | null;
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
        id: string;
        createdAt: Date;
        updatedAt: Date;
        specialty: string | null;
        title: string;
        documentType: string | null;
        source: string | null;
        publicationYear: number | null;
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
        id: string;
        createdAt: Date;
        updatedAt: Date;
        specialty: string | null;
        title: string;
        documentType: string | null;
        source: string | null;
        publicationYear: number | null;
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
        id: string;
        createdAt: Date;
        updatedAt: Date;
        specialty: string | null;
        title: string;
        documentType: string | null;
        source: string | null;
        publicationYear: number | null;
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
        id: string;
        createdAt: Date;
        updatedAt: Date;
        specialty: string | null;
        title: string;
        documentType: string | null;
        source: string | null;
        publicationYear: number | null;
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
        id: string;
        createdAt: Date;
        updatedAt: Date;
        specialty: string | null;
        title: string;
        documentType: string | null;
        source: string | null;
        publicationYear: number | null;
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