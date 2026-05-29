import { Pinecone } from '@pinecone-database/pinecone';
import { EmbeddingService } from './embedding.service';
import { CONFIG } from '../../../config/env';

export interface DocumentChunk {
  text: string;
  chunkIndex: number;
  metadata: Record<string, any>;
}

export class ChunkingService {
  private embeddingService: EmbeddingService;

  constructor() {
    this.embeddingService = new EmbeddingService();
  }

  chunkDocument(content: string, metadata: Record<string, any> = {}): DocumentChunk[] {
    // Semantic chunking based on paragraphs and sentences
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    const chunks: DocumentChunk[] = [];
    
    for (let i = 0; i < paragraphs.length; i++) {
      const para = paragraphs[i];
      const sentences = para.split(/[.!?]+/).filter(s => s.trim().length > 50);
      
      for (const sentence of sentences) {
        const trimmed = sentence.trim();
        if (trimmed.length >= 50) {
          chunks.push({
            text: trimmed,
            chunkIndex: chunks.length,
            metadata: {
              ...metadata,
              source: metadata.source || 'unknown',
              publicationYear: metadata.publicationYear,
              specialty: metadata.specialty || 'general',
            },
          });
        }
      }
    }
    
    return chunks;
  }

  async generateEmbeddings(chunks: DocumentChunk[]): Promise<Array<{ embedding: number[]; chunk: DocumentChunk }>> {
    const texts = chunks.map(c => c.text);
    const embeddings = await this.embeddingService.generateBatchEmbeddings(texts);
    
    return embeddings.map((embedding, i) => ({
      embedding,
      chunk: chunks[i],
    }));
  }
}