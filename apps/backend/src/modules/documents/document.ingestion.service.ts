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
    uploadedById: string;
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
        uploadedById: input.uploadedById,
        fileName: input.fileName,
        fileUrl: input.fileUrl,
        fileType: input.fileType,
        fileSize: input.fileSize,
        ingestionStatus: IngestionStatus.PROCESSING,
      },
    });

    logger.info({
      documentId: document.id,
      extractedLength: input.content.length,
    });

    let cleanContent = input.content;
    if (input.content.includes('<') && input.content.includes('>')) {
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
      source: input.source,
      publicationYear: input.publicationYear,
      specialty: input.specialty || 'general',
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
      const vectors = await this.pineconeService.storeChunks(
        chunks,
        embeddedChunks.map((e) => e.embedding),
        document.id,
      );

      logger.info({
        documentId: document.id,
        uploadedVectors: vectors?.length ?? chunks.length,
      });

      const stats = await this.pineconeService.describeIndexStats();
      logger.info({
        totalVectors: stats?.totalRecordCount,
      });
    } else {
      logger.info(`Mock mode: Skipping Pinecone storage for document ${document.id}`);
    }

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