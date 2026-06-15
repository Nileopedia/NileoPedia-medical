import { CONFIG } from '../../../config/env';
import { logger } from '../../../config/logger';

const USE_MOCK_EMBEDDINGS = process.env.USE_MOCK_EMBEDDINGS === 'true' || !process.env.HF_API_KEY;
const HF_API_KEY = process.env.HF_API_KEY || '';
const HF_EMBEDDING_MODEL = process.env.HF_EMBEDDING_MODEL || 'sentence-transformers/all-MiniLM-L6-v2';

// Hugging Face inference API for embeddings
async function hfEmbedding(text: string): Promise<number[]> {
  const response = await fetch(
    `https://api-inference.huggingface.co/pipeline/feature-extraction/${HF_EMBEDDING_MODEL}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: text }),
    }
  );

  if (!response.ok) {
    throw new Error(`HF embedding failed: ${response.statusText}`);
  }

  const data = await response.json();
  // Flatten nested arrays from HF response
  const flatten = (arr: any[]): number[] => arr.flat(Infinity);
  return flatten(data);
}

export class EmbeddingService {
  constructor() {
    if (USE_MOCK_EMBEDDINGS) {
      logger.info('Using mock embeddings (set HF_API_KEY to enable real Hugging Face embeddings)');
    } else {
      logger.info(`Using Hugging Face embeddings: ${HF_EMBEDDING_MODEL}`);
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    if (USE_MOCK_EMBEDDINGS) {
      return this.generateMockEmbedding(text);
    }
    try {
      const embedding = await hfEmbedding(text);
      return embedding;
    } catch (error) {
      logger.warn('HF embedding failed, falling back to mock:', error);
      return this.generateMockEmbedding(text);
    }
  }

  async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    if (USE_MOCK_EMBEDDINGS) {
      return texts.map(text => this.generateMockEmbedding(text));
    }
    const embeddings = await Promise.all(
      texts.map(text => hfEmbedding(text).catch(() => this.generateMockEmbedding(text)))
    );
    return embeddings;
  }

  private generateMockEmbedding(text: string): number[] {
    const hash = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    // MiniLM produces 384-dim embeddings
    const embedding = new Array(384).fill(0).map((_, i) => {
      const seed = (hash * (i + 1)) % 1000;
      return (seed - 500) / 500;
    });
    return embedding;
  }

  async preprocessText(text: string): Promise<string> {
    let cleaned = text.replace(/\s+/g, ' ').trim();
    cleaned = cleaned.replace(/[^\x00-\x7F]/g, '');
    return cleaned;
  }
}