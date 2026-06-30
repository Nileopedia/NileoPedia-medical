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
    const batchSize = 20;
    
    console.log('[PINECONE] Upserting', vectors.length, 'vectors');
    for (let i = 0; i < vectors.length; i += batchSize) {
      const batch = vectors.slice(i, i + batchSize);
      try {
        await this.index.upsert(batch);
      } catch (error) {
        logger.error('Pinecone upsert batch failed:', { batchStart: i, error });
      }
    }
    console.log('[PINECONE] Upsert complete');
  }

  async query(vector: number[], topK = 10, filter?: Record<string, any>) {
    if (!this.pinecone || !this.index) {
      console.log('[PINECONE] Query skipped - Pinecone not configured');
      return [];
    }
    
    const queryRequest = {
      vector,
      topK,
      includeMetadata: true,
      ...(filter && { filter }),
    };

    const results = await this.index.query(queryRequest);
    const matches = results.matches || [];
    console.log('[PINECONE] Query returned', matches.length, 'matches, scores:', matches.map((m: any) => m.score));
    return matches;
  }

  async deleteVectors(ids: string[]) {
    if (!this.pinecone || !this.index) return;
    await this.index.deleteMany(ids);
  }

  async deleteByDocumentId(documentId: string) {
    if (!this.pinecone || !this.index) return;
    logger.info('Deleting previous vectors', { documentId });
    try {
      await this.index.deleteMany({
        filter: { documentId },
      });
      logger.info(`Deleted vectors for document ${documentId}`);
    } catch (error) {
      logger.error('Failed deleting existing vectors', error);
      throw error;
    }
  }

  async storeChunks(chunks: DocumentChunk[], embeddings: number[][], documentId: string) {
    console.log('[PINECONE] Storing', chunks.length, 'chunks for document:', documentId);
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
    console.log('[PINECONE] Stored', vectors.length, 'vectors for document:', documentId);
    return vectors;
  }

  async searchSimilar(query: string, embeddingService: any, topK = 10, filter?: Record<string, any>) {
    if (!this.pinecone || !this.index) {
      console.log('[PINECONE] searchSimilar skipped - Pinecone not configured');
      return [];
    }
    const queryEmbedding = await embeddingService.generateEmbedding(query);
    return this.query(queryEmbedding, topK, filter);
  }
}