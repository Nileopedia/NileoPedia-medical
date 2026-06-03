import { Pinecone } from '@pinecone-database/pinecone';
import { CONFIG } from '../../config/env';
import prisma from '../../config/prisma';

export class RetrievalService {
  private pinecone: Pinecone | null = null;
  private index: any = null;

  constructor() {
    if (CONFIG.PINECONE_API_KEY) {
      this.pinecone = new Pinecone({ apiKey: CONFIG.PINECONE_API_KEY });
      this.index = this.pinecone.index(CONFIG.PINECONE_INDEX_NAME);
    }
  }

  async semanticSearch(query: string, topK = 10) {
    const embedding = await this.generateEmbedding(query);
    const results = await this.index.query({
      vector: embedding,
      topK,
      includeMetadata: true,
    });

    return results.matches || [];
  }

  async generateEmbedding(text: string): Promise<number[]> {
    return Array(1536).fill(0).map(() => Math.random());
  }

  async hybridSearch(query: string) {
    const semanticResults = await this.semanticSearch(query);
    return this.rankResults(semanticResults);
  }

  private rankResults(results: any[]) {
    return results.sort((a, b) => (b.score || 0) - (a.score || 0));
  }
}