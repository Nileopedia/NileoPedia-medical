import { OpenAI } from 'openai';
import { CONFIG } from '../../../config/env';
import { logger } from '../../../config/logger';

const USE_MOCK_EMBEDDINGS = !CONFIG.OPENAI_API_KEY || process.env.USE_MOCK_AI === 'true';

const generateMockEmbedding = (text: string): number[] => {
  const hash = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const embedding = new Array(1536).fill(0).map((_, i) => {
    const seed = (hash * (i + 1)) % 1000;
    return (seed - 500) / 500;
  });
  return embedding;
};

export class EmbeddingService {
  private openai: OpenAI | null = null;

  constructor() {
    if (CONFIG.OPENAI_API_KEY && !USE_MOCK_EMBEDDINGS) {
      this.openai = new OpenAI({ apiKey: CONFIG.OPENAI_API_KEY });
    } else {
      logger.info('Using mock embeddings (OpenAI API key not configured or mock mode enabled)');
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    if (this.openai) {
      try {
        const response = await this.openai.embeddings.create({
          model: 'text-embedding-3-large',
          input: text,
        });
        return response.data[0].embedding;
      } catch (error) {
        logger.warn('OpenAI embedding failed, falling back to mock:', error);
      }
    }
    return generateMockEmbedding(text);
  }

  async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    if (this.openai) {
      try {
        const response = await this.openai.embeddings.create({
          model: 'text-embedding-3-large',
          input: texts,
        });
        return response.data.map((item) => item.embedding);
      } catch (error) {
        logger.warn('OpenAI batch embeddings failed, falling back to mock:', error);
      }
    }
    return texts.map(text => generateMockEmbedding(text));
  }

  async preprocessText(text: string): Promise<string> {
    let cleaned = text.replace(/\s+/g, ' ').trim();
    cleaned = cleaned.replace(/[^\x00-\x7F]/g, '');
    return cleaned;
  }
}