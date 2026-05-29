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
    }) | null>;
    createDocument(data: CreateDocumentDto): Promise<{
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
    }>;
    updateDocument(id: string, data: UpdateDocumentDto): Promise<{
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
    }>;
    deleteDocument(id: string): Promise<{
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
    }>;
    verifyDocument(id: string): Promise<{
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
    }>;
    updateIngestionStatus(id: string, status: IngestionStatus): Promise<{
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
    }>;
    getIngestionStatus(id: string): Promise<{
        documentId: string;
        ingestionStatus: import("@prisma/client").$Enums.IngestionStatus;
        chunksProcessed: number;
        vectorsStored: number;
    }>;
}
//# sourceMappingURL=document.service.d.ts.map