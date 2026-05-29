import prisma from '../../config/prisma';
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
    category?: string;
    source?: string;
    content: string;
    publicationYear?: number;
    specialty?: string;
    uploadedBy?: string;
  }) {
    const cleanedContent = input.content;
    
    const document = await prisma.medicalDocument.create({
      data: {
        title: input.title,
        category: input.category,
        source: input.source,
        content: cleanedContent,
        uploadedBy: input.uploadedBy,
        isVerified: false,
        version: 1,
      },
    });

    const chunks = this.chunkingService.chunkDocument(cleanedContent, {
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

    return { document, chunksCount: chunks.length };
  }
}