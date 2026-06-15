import { Pinecone } from '@pinecone-database/pinecone';
import { CONFIG } from '../../config/env';
import prisma from '../../config/prisma';
import { logger } from '../../config/logger';
import { EmbeddingService } from '../rag/services/embedding.service';

export class RetrievalService {
  private pinecone: Pinecone | null = null;
  private index: any = null;
  private embeddingService: EmbeddingService;

  get pineconeClient() {
    return this.pinecone;
  }

  constructor() {
    this.embeddingService = new EmbeddingService();
    if (CONFIG.PINECONE_API_KEY && !CONFIG.USE_MOCK_EMBEDDINGS) {
      this.pinecone = new Pinecone({ apiKey: CONFIG.PINECONE_API_KEY });
      this.index = this.pinecone.index(CONFIG.PINECONE_INDEX_NAME);
    } else {
      logger.info('Using mock search mode');
    }
  }

  async semanticSearch(query: string, topK = 10) {
    if (!this.index) {
      return this.getMockResults(query, topK);
    }
    
    const embedding = await this.embeddingService.generateEmbedding(query);
    const results = await this.index.query({
      vector: embedding,
      topK,
      includeMetadata: true,
    });

    return results.matches || [];
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