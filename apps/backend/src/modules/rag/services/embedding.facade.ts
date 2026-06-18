import { EmbeddingService } from './services/embedding.service';
import { MockEmbeddingProvider } from './services/mock.embedding';
import { LocalEmbeddingProvider } from './services/local.embedding';
import { HFEmbeddingProvider } from './services/hf.embedding';

export interface EmbeddingProvider {
  generateEmbedding(text: string): Promise<number[]>;
  generateBatchEmbeddings?(texts: string[]): Promise<number[][]>;
  embeddingSource: string;
}

export class EmbeddingService {
  private provider: EmbeddingProvider;

  static create(config?: { useMock?: boolean; useLocal?: boolean }): EmbeddingService {
    return new EmbeddingService(config);
  }

  constructor(config?: { useMock?: boolean; useLocal?: boolean }) {
    // In test environment, always use mock
    if (process.env.NODE_ENV === 'test' || config?.useMock) {
      this.provider = new MockEmbeddingProvider();
    } else if (config?.useLocal) {
      this.provider = new LocalEmbeddingProvider();
    } else {
      this.provider = new HFEmbeddingProvider();
    }
  }

  get isRealEmbeddings(): boolean {
    return this.provider.embeddingSource !== 'mock';
  }

  get embeddingSource(): string {
    return this.provider.embeddingSource;
  }

  async generateEmbedding(text: string): Promise<number[]> {
    return this.provider.generateEmbedding(text);
  }

  async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    return this.provider.generateBatchEmbeddings?.(texts) ?? texts.map(t => this.generateEmbedding(t));
  }

  async preprocessText(text: string): Promise<string> {
    return text.replace(/\s+/g, ' ').trim().replace(/[^\x00-\x7F]/g, '');
  }
}