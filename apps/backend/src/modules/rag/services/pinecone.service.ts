import { Pinecone } from '@pinecone-database/pinecone';
import { CONFIG } from '../../../config/env';
import { logger } from '../../../config/logger';
import { DocumentChunk } from './chunking.service';

interface MockVector {
  id: string;
  values: number[];
  metadata?: Record<string, any>;
}

const mockVectors: MockVector[] = [];

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
}

export class PineconeService {
  private pinecone: Pinecone | null = null;

  private index: any;

  private isAvailable: boolean = false;

  static mockVectors: MockVector[] = mockVectors;

  constructor() {
    if (CONFIG.PINECONE_API_KEY) {
      try {
        this.pinecone = new Pinecone({ apiKey: CONFIG.PINECONE_API_KEY });
        this.index = this.pinecone.index(CONFIG.PINECONE_INDEX_NAME);
        this.isAvailable = true;
      } catch (e) {
        logger.error('Pinecone initialization failed, using mock mode:', e);
        this.isAvailable = false;
      }
    }
    if (!this.isAvailable) {
      logger.info('Using mock vector search (Pinecone not available)');
    }
  }

  isMockMode(): boolean {
    return !this.isAvailable;
  }

  pineconeClient() {
    return this;
  }

  async upsertVectors(vectors: Array<{ id: string; values: number[]; metadata?: Record<string, any> }>): Promise<{ success: number; failed: number }> {
    if (this.isAvailable && this.index) {
      const batchSize = 20;
      console.log('[PINECONE] Upserting', vectors.length, 'vectors');
      let success = 0;
      let failed = 0;
      for (let i = 0; i < vectors.length; i += batchSize) {
        const batch = vectors.slice(i, i + batchSize);
        try {
          await this.index.upsert(batch);
          success += batch.length;
        } catch (error: any) {
          failed += batch.length;
          const errorMessage = error?.message || error?.toString?.() || 'Unknown error';
          const errorCode = error?.code || error?.status || error?.name || 'unknown';
          const errorStack = error?.stack || '';
          logger.error('Pinecone upsert batch failed:', {
            batchStart: i,
            batchSize: batch.length,
            errorMessage,
            errorCode,
            errorStack: errorStack ? errorStack.split('\n').slice(0, 3).join('\n') : undefined,
          });
          console.error(`[PINECONE] Upsert batch ${i}-${i + batch.length} failed: ${errorMessage} (${errorCode})`);
        }
      }
      console.log('[PINECONE] Upsert complete', { success, failed });
      return { success, failed };
    } else {
      PineconeService.mockVectors.push(...vectors);
      console.log('[MOCK] Stored', vectors.length, 'vectors (mock mode), total:', PineconeService.mockVectors.length);
      return { success: vectors.length, failed: 0 };
    }
  }

  async query(vector: number[], topK = 10, filter?: Record<string, any>) {
    if (this.isAvailable && this.index) {
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

    if (!PineconeService.mockVectors.length) {
      console.log('[MOCK] Query skipped - no vectors in mock store');
      return [];
    }

    const scored = PineconeService.mockVectors.map((v) => ({
      id: v.id,
      score: cosineSimilarity(vector, v.values),
      metadata: v.metadata,
    }));

    const filtered = filter
      ? scored.filter((m) => m.metadata && Object.keys(filter).every((k) => m.metadata?.[k] === filter[k]))
      : scored;

    const sorted = filtered.sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, topK);
    console.log('[MOCK] Query returned', sorted.length, 'matches, max score:', sorted[0]?.score);
    return sorted;
  }

  async deleteVectors(ids: string[]) {
    if (this.isAvailable && this.index) {
      await this.index.deleteMany(ids);
    } else {
      PineconeService.mockVectors = PineconeService.mockVectors.filter((v) => !ids.includes(v.id));
    }
  }

  async deleteByDocumentId(documentId: string) {
    if (this.isAvailable && this.index) {
      logger.info('Deleting previous vectors', { documentId });
      try {
        await this.index.deleteMany({
          filter: { documentId: { $eq: documentId } },
        });
        logger.info(`Deleted vectors for document ${documentId}`);
      } catch (error) {
        logger.error('Failed deleting existing vectors', error);
        throw error;
      }
    } else {
      const before = PineconeService.mockVectors.length;
      PineconeService.mockVectors = PineconeService.mockVectors.filter((v) => v.metadata?.documentId !== documentId);
      console.log(`[MOCK] Deleted ${before - PineconeService.mockVectors.length} vectors for document ${documentId}`);
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
        text: chunks[i].text,
        ...chunks[i].metadata,
      },
    }));

    const result = await this.upsertVectors(vectors);
    console.log('[PINECONE] Stored', result.success, 'of', vectors.length, 'vectors for document:', documentId);
    return { vectors, result };
  }

  async searchSimilar(query: string, embeddingService: any, topK = 10, filter?: Record<string, any>) {
    const queryEmbedding = await embeddingService.generateEmbedding(query);
    return this.query(queryEmbedding, topK, filter);
  }

  async describeIndexStats() {
    if (this.isAvailable && this.index) {
      try {
        const stats = await this.index.describeIndexStats();
        return stats;
      } catch (error) {
        logger.error('Failed to describe index stats:', error);
        return null;
      }
    }
    return { totalVectorCount: PineconeService.mockVectors.length, dimension: 384 };
  }

  async validateIndex(expectedDimension = 384): Promise<{ valid: boolean; dimension?: number; error?: string }> {
    if (!this.isAvailable || !this.index) {
      return { valid: false, error: 'Pinecone not available' };
    }

    try {
      const stats = await this.index.describeIndexStats();
      const dimension = (stats as any).dimension;

      if (!dimension) {
        return { valid: false, error: 'Could not determine index dimension. Index may not exist or is not ready.' };
      }

      if (dimension !== expectedDimension) {
        return {
          valid: false,
          dimension,
          error: `Index dimension mismatch: index has ${dimension}D but embedding model produces ${expectedDimension}D vectors`,
        };
      }

      return { valid: true, dimension };
    } catch (error: any) {
      const errorMessage = error?.message || error?.toString?.() || 'Unknown validation error';
      return { valid: false, error: `Index validation failed: ${errorMessage}` };
    }
  }
}