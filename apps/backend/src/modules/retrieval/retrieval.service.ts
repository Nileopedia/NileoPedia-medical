import { Pinecone } from '@pinecone-database/pinecone';
import { CONFIG } from '../../config/env';
import { logger } from '../../config/logger';
import { EmbeddingService } from '../rag/services/embedding.service';

export class RetrievalService {
  private pinecone: Pinecone | null = null;
  private index: any = null;
  public embeddingService: EmbeddingService;

  get pineconeClient() {
    return this.pinecone;
  }

  constructor() {
    this.embeddingService = new EmbeddingService();
    if (CONFIG.PINECONE_API_KEY && !CONFIG.USE_MOCK_EMBEDDINGS) {
      try {
        this.pinecone = new Pinecone({ apiKey: CONFIG.PINECONE_API_KEY });
        this.index = this.pinecone.index(CONFIG.PINECONE_INDEX_NAME);
      } catch (e) {
        logger.error('[ERROR] Pinecone unavailable');
      }
    }
  }

  async semanticSearch(query: string, topK = 10) {
    if (!this.index) {
      logger.error('[ERROR] Pinecone unavailable');
      return [];
    }
    
    const embedding = await this.embeddingService.generateEmbedding(query);
    console.log('[PINECONE] Query embedding dimensions:', embedding.length);
    const results = await this.index.query({
      vector: embedding,
      topK,
      includeMetadata: true,
    });

    console.log('[PINECONE] Matches:', results.matches?.length);
    console.log('[PINECONE] Scores:', results.matches?.map((m: any) => m.score));

    return results.matches || [];
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

  getRelevantDocs(query: string, topK = 10, minScore = 0.75) {
    return this.semanticSearch(query, topK).then((matches) => {
      const relevant = matches.filter((match: any) => (match.score ?? 0) >= minScore);
      if (relevant.length === 0) {
        return { hasContext: false, context: '' };
      }
      return { hasContext: true, context: relevant };
    });
  }
}
