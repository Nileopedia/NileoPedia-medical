import { Pinecone } from '@pinecone-database/pinecone';
import { CONFIG } from '../../../config/env';
import { logger } from '../../../config/logger';
import { DocumentChunk } from './chunking.service';

const USE_MOCK_AI = process.env.USE_MOCK_AI === 'true' || !process.env.PINECONE_API_KEY;

export class PineconeService {
  private pinecone: Pinecone | null = null;
  private index: any;

  constructor() {
    if (!USE_MOCK_AI && CONFIG.PINECONE_API_KEY) {
      this.pinecone = new Pinecone({ apiKey: CONFIG.PINECONE_API_KEY });
      this.index = this.pinecone.index(CONFIG.PINECONE_INDEX_NAME);
    } else {
      logger.info('Using mock search mode (Pinecone not configured)');
    }
  }

  async upsertVectors(vectors: Array<{ id: string; values: number[]; metadata?: Record<string, any> }>) {
    if (!this.pinecone || !this.index) return;
    const batchSize = 100;
    
    for (let i = 0; i < vectors.length; i += batchSize) {
      const batch = vectors.slice(i, i + batchSize);
      await this.index.upsert(batch);
    }
  }

  async query(vector: number[], topK = 10, filter?: Record<string, any>) {
    if (!this.pinecone || !this.index) {
      return [];
    }
    const queryRequest = {
      vector,
      topK,
      includeMetadata: true,
      ...(filter && { filter }),
    };

    const results = await this.index.query(queryRequest);
    return results.matches || [];
  }

  async deleteVectors(ids: string[]) {
    if (!this.pinecone || !this.index) return;
    await this.index.delete(ids);
  }

  async storeChunks(chunks: DocumentChunk[], embeddings: number[][], documentId: string) {
    const vectors = embeddings.map((embedding, i) => ({
      id: `${documentId}_chunk_${i}`,
      values: embedding,
      metadata: {
        documentId,
        chunkIndex: chunks[i].chunkIndex,
        textPreview: chunks[i].text.substring(0, 100),
        ...chunks[i].metadata,
      },
    }));

    await this.upsertVectors(vectors);
    return vectors;
  }

  async searchSimilar(query: string, embeddingService: any, topK = 10, filter?: Record<string, any>) {
    if (!this.pinecone || !this.index) {
      return [];
    }
    const queryEmbedding = await embeddingService.generateEmbedding(query);
    return this.query(queryEmbedding, topK, filter);
  }
}