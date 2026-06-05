import { Pinecone } from '@pinecone-database/pinecone';
import { CONFIG } from '../../config/env';
import prisma from '../../config/prisma';

export class RetrievalService {
  private pinecone: Pinecone | null = null;
  private index: any = null;

  get pineconeClient() {
    return this.pinecone;
  }

  constructor() {
    if (CONFIG.PINECONE_API_KEY) {
      this.pinecone = new Pinecone({ apiKey: CONFIG.PINECONE_API_KEY });
      this.index = this.pinecone.index(CONFIG.PINECONE_INDEX_NAME);
    }
  }

  async semanticSearch(query: string, topK = 10) {
    const embedding = await this.generateEmbedding(query);
    if (!this.index) return [];

    const results = await this.index.query({
      vector: embedding,
      topK,
      includeMetadata: true,
    });

    return results.matches || [];
  }

  async generateEmbedding(text: string): Promise<number[]> {
    // Call the ai-service for real embeddings
    const axios = require('axios');
    try {
      const response = await axios.post(
        `${CONFIG.AI_SERVICE_URL}/embeddings/`,
        { text },
        { timeout: 30000 }
      );
      return response.data.embedding || [];
    } catch (error) {
      console.error('Embedding generation failed:', error);
      return [];
    }
  }

  async hybridSearch(query: string, specialty?: string) {
    const pineconeResults = await this.semanticSearch(query);

    // Filter by specialty if provided
    let results = pineconeResults;
    if (specialty && this.index) {
      const filtered = [];
      for (const match of pineconeResults) {
        const metadata = match.metadata || {};
        if (metadata.specialty === specialty.toLowerCase() || !metadata.specialty) {
          filtered.push(match);
        }
      }
      results = filtered;
    }

    return this.rankResults(results);
  }

  private rankResults(results: any[]) {
    return results.sort((a, b) => (b.score || 0) - (a.score || 0));
  }
}