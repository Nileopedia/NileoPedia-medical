import { CONFIG } from '../../../config/env';
import { logger } from '../../../config/logger';

const USE_MOCK_EMBEDDINGS = !CONFIG.GROQ_API_KEY || process.env.USE_MOCK_AI === 'true';

// Groq doesn't provide embeddings - use mock deterministic embeddings
const generateMockEmbedding = (text: string): number[] => {
  const hash = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  // Groq uses 3072-dim embeddings for llama-3.3-70b-versatile
  // But for compatibility, we'll use 1536 (same as OpenAI)
  const embedding = new Array(1536).fill(0).map((_, i) => {
    const seed = (hash * (i + 1)) % 1000;
    return (seed - 500) / 500;
  });
  return embedding;
};

export class EmbeddingService {
  constructor() {
    if (!USE_MOCK_EMBEDDINGS) {
      logger.info('Using Groq for embeddings (note: using mock embeddings as Groq does not provide embedding API)');
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    if (USE_MOCK_EMBEDDINGS) {
      return generateMockEmbedding(text);
    }
    // Groq doesn't have embeddings API - fallback to mock
    return generateMockEmbedding(text);
  }

  async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    return texts.map(text => generateMockEmbedding(text));
  }

  async preprocessText(text: string): Promise<string> {
    let cleaned = text.replace(/\s+/g, ' ').trim();
    cleaned = cleaned.replace(/[^\x00-\x7F]/g, '');
    return cleaned;
  }
}