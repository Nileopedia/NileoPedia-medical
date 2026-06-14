import prisma from '../../config/prisma';
import { IngestionStatus } from '@prisma/client';
import { EmbeddingService } from '../rag/services/embedding.service';
import { ChunkingService } from '../rag/services/chunking.service';
import { PineconeService } from '../rag/services/pinecone.service';
import { logger } from '../../../config/logger';

const USE_MOCK_AI = process.env.USE_MOCK_AI === 'true' || !process.env.PINECONE_API_KEY;

export class DocumentIngestionService {
  private embeddingService: EmbeddingService;
  private chunkingService: ChunkingService;
  private pineconeService: PineconeService | null = null;

  constructor() {
    this.embeddingService = new EmbeddingService();
    this.chunkingService = new ChunkingService();
    if (!USE_MOCK_AI && process.env.PINECONE_API_KEY) {
      this.pineconeService = new PineconeService();
    }
  }

  async ingestDocument(input: {
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
  }) {
    const document = await prisma.medicalDocument.create({
      data: {
        title: input.title,
        description: input.description,
        source: input.source,
        publicationYear: input.publicationYear,
        specialty: input.specialty,
        uploadedById: input.uploadedById,
        fileName: input.fileName,
        fileUrl: input.fileUrl,
        fileType: input.fileType,
        fileSize: input.fileSize,
        ingestionStatus: IngestionStatus.PROCESSING,
      },
    });

    const chunks = this.chunkingService.chunkDocument(input.content, {
      source: input.source,
      publicationYear: input.publicationYear,
      specialty: input.specialty || 'general',
    });

    const embeddedChunks = await this.chunkingService.generateEmbeddings(chunks);
    
    if (this.pineconeService && process.env.PINECONE_API_KEY) {
      await this.pineconeService.storeChunks(
        chunks,
        embeddedChunks.map(e => e.embedding),
        document.id
      );
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