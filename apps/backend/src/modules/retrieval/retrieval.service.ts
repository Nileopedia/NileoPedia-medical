import { Pinecone } from '@pinecone-database/pinecone';
import { CONFIG } from '../../config/env';
import prisma from '../../config/prisma';
import { logger } from '../../config/logger';

const USE_MOCK_AI = process.env.USE_MOCK_AI === 'true' || !process.env.PINECONE_API_KEY;

export class RetrievalService {
  private pinecone: Pinecone | null = null;
  private index: any = null;

  get pineconeClient() {
    return this.pinecone;
  }

  constructor() {
    if (!USE_MOCK_AI && CONFIG.PINECONE_API_KEY) {
      this.pinecone = new Pinecone({ apiKey: CONFIG.PINECONE_API_KEY });
      this.index = this.pinecone.index(CONFIG.PINECONE_INDEX_NAME);
    } else {
      logger.info('Using mock search mode');
    }
  }

  async semanticSearch(query: string, topK = 10) {
    const embedding = await this.generateEmbedding(query);
    if (!this.index) {
      return this.getMockResults(query, topK);
    }

    const results = await this.index.query({
      vector: embedding,
      topK,
      includeMetadata: true,
    });

    return results.matches || [];
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const hash = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return new Array(1536).fill(0).map((_, i) => {
      const seed = (hash * (i + 1)) % 1000;
      return (seed - 500) / 500;
    });
  }

  private getMockResults(query: string, topK = 10) {
    const demoChunks = [
      { id: 'mock-1', score: 0.95, metadata: { documentId: 'demo-doc-1', textPreview: `Medical guideline for ${query}: Evidence-based recommendation`, specialty: 'general' } },
      { id: 'mock-2', score: 0.88, metadata: { documentId: 'demo-doc-2', textPreview: `Clinical study: ${query} treatment protocols`, specialty: 'general' } },
      { id: 'mock-3', score: 0.82, metadata: { documentId: 'demo-doc-3', textPreview: `Research findings: ${query} outcomes`, specialty: 'cardiology' } },
    ];
    return demoChunks.slice(0, topK);
  }

  async hybridSearch(query: string, specialty?: string) {
    const pineconeResults = await this.semanticSearch(query);
    let results = pineconeResults;

    if (specialty) {
      const filtered = pineconeResults.filter((match: any) => {
        const metadata = match.metadata || {};
        return metadata.specialty === specialty.toLowerCase() || !metadata.specialty;
      });
      results = filtered.length > 0 ? filtered : pineconeResults;
    }

    return this.rankResults(results);
  }

  private rankResults(results: any[]) {
    return results.sort((a, b) => (b.score || 0) - (a.score || 0));
  }
}