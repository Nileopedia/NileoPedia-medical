import { OpenAI } from 'openai';
import { CONFIG } from '../../../config/env';

export class EmbeddingService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({ apiKey: CONFIG.OPENAI_API_KEY });
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const response = await this.openai.embeddings.create({
      model: 'text-embedding-3-large',
      input: text,
    });

    return response.data[0].embedding;
  }

  async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    const response = await this.openai.embeddings.create({
      model: 'text-embedding-3-large',
      input: texts,
    });

    return response.data.map((item) => item.embedding);
  }

  async preprocessText(text: string): Promise<string> {
    // Remove excessive whitespace
    let cleaned = text.replace(/\s+/g, ' ').trim();
    
    // Remove broken OCR patterns (common artifacts)
    cleaned = cleaned.replace(/[^\x00-\x7F]/g, '');
    
    return cleaned;
  }
}