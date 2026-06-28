import prisma from '../../config/prisma';
import { IngestionStatus } from '@prisma/client';
import {
  CreateDocumentDto,
  UpdateDocumentDto,
  GetDocumentsQuery,
  GetDocumentsResult,
} from './document.types';
import { DocumentMetadataService } from './metadata.service';

export class DocumentService {
  private metadataService: DocumentMetadataService;

  constructor() {
    this.metadataService = new DocumentMetadataService();
  }

  async getAllDocuments(query: GetDocumentsQuery): Promise<GetDocumentsResult> {
    const { page, limit, search, ingestionStatus, documentType, publicationYear } = query;
    const skip = (page - 1) * limit;

    const where: {
      OR?: Array<{ title?: { contains: string; mode: 'insensitive' }; description?: { contains: string; mode: 'insensitive' } }>;
      ingestionStatus?: IngestionStatus;
      documentType?: string;
      publicationYear?: number;
    } = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (ingestionStatus) where.ingestionStatus = ingestionStatus as IngestionStatus;
    if (documentType) where.documentType = documentType;
    if (publicationYear) where.publicationYear = publicationYear;

    const [documents, total] = await Promise.all([
      prisma.medicalDocument.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          embeddingMetadata: true,
          documentMetadata: true,
        },
      }),
      prisma.medicalDocument.count({ where }),
    ]);

    return {
      documents: documents.map(doc => ({
        ...doc,
        metadata: doc.documentMetadata || undefined,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getDocumentById(id: string) {
    return prisma.medicalDocument.findUnique({
      where: { id },
      include: {
        embeddingMetadata: true,
        documentMetadata: true,
      },
    });
  }

  async createDocument(data: CreateDocumentDto) {
    return prisma.medicalDocument.create({
      data: {
        title: data.title,
        description: data.description,
        fileName: data.fileName,
        fileUrl: data.fileUrl,
        fileType: data.fileType,
        fileSize: data.fileSize,
        specialty: data.specialty,
        documentType: data.documentType,
        source: data.source,
        publicationYear: data.publicationYear,
        uploadedById: data.uploadedById,
        ingestionStatus: IngestionStatus.PENDING,
      },
    });
  }

  async updateDocument(id: string, data: UpdateDocumentDto) {
    const document = await prisma.medicalDocument.findUnique({ where: { id } });
    if (!document) {
      throw new Error('Document not found');
    }

    return prisma.medicalDocument.update({
      where: { id },
      data,
    });
  }

  async deleteDocument(id: string) {
    const document = await prisma.medicalDocument.findUnique({ where: { id } });
    if (!document) {
      throw new Error('Document not found');
    }

    await prisma.documentMetadata.deleteMany({
      where: { documentId: id },
    });

    await prisma.medicalDocument.delete({
      where: { id },
    });
  }

  async verifyDocument(id: string) {
    const document = await prisma.medicalDocument.findUnique({ where: { id } });
    if (!document) {
      throw new Error('Document not found');
    }

    if (document.ingestionStatus !== IngestionStatus.PENDING) {
      throw new Error('Document is not pending verification');
    }

    await prisma.medicalDocument.update({
      where: { id },
      data: { isVerified: true, ingestionStatus: IngestionStatus.PROCESSING },
    });

    const { documentQueue } = await import('../../jobs/queues');
    if (document.fileUrl) {
      await documentQueue.add('ingest', {
        documentId: id,
        fileUrl: document.fileUrl,
        fileType: document.fileType,
        fileName: document.fileName,
        title: document.title,
        specialty: document.specialty,
        documentType: document.documentType,
        uploadedById: document.uploadedById,
        source: document.source,
        publicationYear: document.publicationYear,
      });
    }

    return prisma.medicalDocument.findUnique({ where: { id } });
  }

  async updateIngestionStatus(id: string, status: IngestionStatus) {
    return prisma.medicalDocument.update({
      where: { id },
      data: { ingestionStatus: status },
    });
  }

  async getIngestionStatus(id: string) {
    const document = await prisma.medicalDocument.findUnique({
      where: { id },
      select: {
        id: true,
        ingestionStatus: true,
        embeddingMetadata: {
          select: { id: true },
        },
        documentMetadata: true,
      },
    });

    if (!document) {
      throw new Error('Document not found');
    }

    return {
      documentId: document.id,
      ingestionStatus: document.ingestionStatus,
      chunksProcessed: document.embeddingMetadata.length,
      vectorsStored: document.embeddingMetadata.length,
      metadata: document.documentMetadata || undefined,
    };
  }
}
