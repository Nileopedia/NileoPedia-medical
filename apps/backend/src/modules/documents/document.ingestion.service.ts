import { IngestionStatus } from '@prisma/client';
import prisma from '../../config/prisma';
import { EmbeddingService } from '../rag/services/embedding.service';
import { ChunkingService } from '../rag/services/chunking.service';
import { PineconeService } from '../rag/services/pinecone.service';
import { logger } from '../../config/logger';
import { CONFIG } from '../../config/env';

export class DocumentIngestionService {
  private embeddingService: EmbeddingService;

  private chunkingService: ChunkingService;

  private pineconeService: PineconeService | null = null;

  constructor() {
    this.embeddingService = new EmbeddingService();
    this.chunkingService = new ChunkingService();
    this.pineconeService = new PineconeService();
  }

  async ingestDocument(input: {
    title: string;
    description?: string;
    source?: string;
    content: string;
    publicationYear?: number;
    specialty?: string;
    documentType?: string;
    uploadedById?: string;
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
  }) {
    const document = await prisma.medicalDocument.create({
      data: {
        title: input.title,
        description: input.description,
        source: input.source,
        publicationYear: input.publicationYear,
        specialty: input.specialty,
        documentType: input.documentType,
        uploadedById: input.uploadedById ?? null,
        fileName: input.fileName,
        fileUrl: input.fileUrl,
        fileType: input.fileType,
        fileSize: input.fileSize,
        ingestionStatus: IngestionStatus.PROCESSING,
      },
    });

    return this.ingestContentForDocument(document.id, input.content, {
      title: input.title,
      source: input.source,
      specialty: input.specialty,
      documentType: input.documentType,
      publicationYear: input.publicationYear,
    });
  }

  async ingestContentForDocument(
    documentId: string,
    content: string,
    meta: { title?: string; source?: string; specialty?: string; documentType?: string; publicationYear?: number }
  ) {
    const document = await prisma.medicalDocument.update({
      where: { id: documentId },
      data: { ingestionStatus: IngestionStatus.PROCESSING },
    });

    logger.info({
      documentId: document.id,
      extractedLength: content.length,
    });

    let cleanContent = content;
    if (content.includes('<') && content.includes('>')) {
      cleanContent = cleanContent
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, '')
        .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, '')
        .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '')
        .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, '')
        .replace(/<img\b[^>]*>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }

    const chunks = this.chunkingService.chunkDocument(cleanContent, {
      source: meta.source,
      publicationYear: meta.publicationYear,
      specialty: meta.specialty || 'general',
    });

    logger.info({
      documentId: document.id,
      chunkCount: chunks.length,
    });

    const embeddedChunks = await this.chunkingService.generateEmbeddings(chunks);

    logger.info({
      documentId: document.id,
      embeddingCount: embeddedChunks.length,
      dimensions: embeddedChunks[0]?.embedding?.length,
    });

    if (this.pineconeService && CONFIG.PINECONE_API_KEY) {
      const storeResult = await this.pineconeService.storeChunks(
        chunks,
        embeddedChunks.map((e) => e.embedding),
        document.id,
      );

      logger.info({
        documentId: document.id,
        uploadedVectors: storeResult.vectors.length,
        successCount: storeResult.result.success,
        failedCount: storeResult.result.failed,
      });

      if (storeResult.result.failed > 0) {
        const error = new Error(`Failed to store ${storeResult.result.failed} of ${storeResult.vectors.length} vectors in Pinecone for document ${document.id}`);
        logger.error(error.message);
        await prisma.medicalDocument.update({
          where: { id: document.id },
          data: { ingestionStatus: IngestionStatus.FAILED },
        });
        throw error;
      }

      const stats = await this.pineconeService.describeIndexStats();
      logger.info({
        totalVectors: stats?.totalRecordCount,
      });
    } else {
      logger.info(`Mock mode: Skipping Pinecone storage for document ${document.id}`);
    }

    await prisma.embeddingMetadata.deleteMany({
      where: { documentId: document.id },
    });

    for (let i = 0; i < chunks.length; i++) {
      await prisma.embeddingMetadata.create({
        data: {
          documentId: document.id,
          pineconeVectorId: `${document.id}_chunk_${i}`,
          chunkIndex: chunks[i].chunkIndex,
          chunkText: chunks[i].text,
        },
      });
    }

    await prisma.medicalDocument.update({
      where: { id: document.id },
      data: { ingestionStatus: IngestionStatus.COMPLETED },
    });

    return { document, chunksCount: chunks.length };
  }
}