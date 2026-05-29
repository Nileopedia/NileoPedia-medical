import { DocumentIngestionService } from './document.ingestion.service';
import prisma from '../../config/prisma';

export class DocumentService {
  private ingestionService: DocumentIngestionService;

  constructor() {
    this.ingestionService = new DocumentIngestionService();
  }

  async getDocuments() {
    return prisma.medicalDocument.findMany();
  }

  async verifyDocument(documentId: string) {
    return prisma.medicalDocument.update({
      where: { id: documentId },
      data: { isVerified: true },
    });
  }
}