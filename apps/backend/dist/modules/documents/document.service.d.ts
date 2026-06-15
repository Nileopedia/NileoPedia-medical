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
    }) | null>;
    createDocument(data: CreateDocumentDto): Promise<{
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
    }>;
    updateDocument(id: string, data: UpdateDocumentDto): Promise<{
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
    }>;
    deleteDocument(id: string): Promise<{
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
    }>;
    verifyDocument(id: string): Promise<{
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
    } | null>;
    updateIngestionStatus(id: string, status: IngestionStatus): Promise<{
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
    }>;
    getIngestionStatus(id: string): Promise<{
        documentId: string;
        ingestionStatus: import("@prisma/client").$Enums.IngestionStatus;
        chunksProcessed: number;
        vectorsStored: number;
    }>;
}
//# sourceMappingURL=document.service.d.ts.map