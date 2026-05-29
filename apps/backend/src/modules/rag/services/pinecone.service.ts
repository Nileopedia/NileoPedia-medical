import { Pinecone } from '@pinecone-database/pinecone';
import { CONFIG } from '../../../config/env';
import { DocumentChunk } from './chunking.service';

export class PineconeService {
  private pinecone: Pinecone;
  private index: any;

  constructor() {
    this.pinecone = new Pinecone({ apiKey: CONFIG.PINECONE_API_KEY });
    this.index = this.pinecone.index(CONFIG.PINECONE_INDEX_NAME);
  }

  async upsertVectors(vectors: Array<{ id: string; values: number[]; metadata?: Record<string, any> }>) {
    const batchSize = 100;
    
    for (let i = 0; i < vectors.length; i += batchSize) {
      const batch = vectors.slice(i, i + batchSize);
      await this.index.upsert(batch);
    }
  }

  async query(vector: number[], topK = 10, filter?: Record<string, any>) {
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
    const queryEmbedding = await embeddingService.generateEmbedding(query);
    return this.query(queryEmbedding, topK, filter);
  }
}