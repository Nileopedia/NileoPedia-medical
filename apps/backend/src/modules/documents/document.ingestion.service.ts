import prisma from '../../config/prisma';
import { IngestionStatus } from '@prisma/client';
import { EmbeddingService } from '../rag/services/embedding.service';
import { ChunkingService } from '../rag/services/chunking.service';
import { PineconeService } from '../rag/services/pinecone.service';

export class DocumentIngestionService {
  private embeddingService: EmbeddingService;
  private chunkingService: ChunkingService;
  private pineconeService: PineconeService;

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
    
    await this.pineconeService.storeChunks(
      chunks,
      embeddedChunks.map(e => e.embedding),
      document.id
    );

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