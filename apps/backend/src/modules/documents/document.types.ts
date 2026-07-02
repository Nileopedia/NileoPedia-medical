import { MedicalDocument, IngestionStatus } from '@prisma/client';

export interface CreateDocumentDto {
  title: string;
  description?: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  specialty?: string;
  documentType?: string;
  source?: string;
  publicationYear?: number;
  uploadedById: string;
}

export interface UpdateDocumentDto {
  title?: string;
  description?: string;
  specialty?: string;
  documentType?: string;
  source?: string;
  publicationYear?: number;
}

export interface GetDocumentsQuery {
  page: number;
  limit: number;
  search?: string;
  ingestionStatus?: IngestionStatus;
  documentType?: string;
  publicationYear?: number;
}

export interface GetDocumentsResult {
  documents: (MedicalDocument & { metadata?: any })[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DocumentIngestionStatus {
  documentId: string;
  ingestionStatus: IngestionStatus;
  chunksProcessed: number;
  vectorsStored: number;
}
