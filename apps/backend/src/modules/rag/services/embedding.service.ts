import { CONFIG } from '../../../config/env';
import { logger } from '../../../config/logger';

// Dynamic fetch import to support ES modules and CommonJS
let fetch: any;
async function getFetch() {
  if (!fetch) {
    fetch = (await import('node-fetch')).default || (await import('node-fetch'));
  }
  return fetch;
}

const HF_API_KEY = CONFIG.HF_API_KEY;
const HF_EMBEDDING_MODEL = CONFIG.HF_EMBEDDING_MODEL;
const EXPECTED_DIMENSIONS = 384;
// Force mock mode in test environment to avoid network calls and dynamic imports
const IS_TEST = process.env.NODE_ENV === 'test';
const LOCAL_EMBEDDING_ENABLED = process.env.LOCAL_EMBEDDINGS !== 'false' && !IS_TEST;

// Log environment on module load
console.log('[EmbeddingService] Configuration check:', {
  HF_API_KEY_EXISTS: !!HF_API_KEY,
  HF_API_KEY_LENGTH: HF_API_KEY?.length || 0,
  HF_EMBEDDING_MODEL: HF_EMBEDDING_MODEL,
  USE_MOCK_EMBEDDINGS: CONFIG.USE_MOCK_EMBEDDINGS,
  LOCAL_EMBEDDINGS_ENABLED: LOCAL_EMBEDDING_ENABLED,
});

if (CONFIG.USE_MOCK_EMBEDDINGS) {
  console.warn('[EmbeddingService] WARNING: USE_MOCK_EMBEDDINGS=true - mock embeddings will be used');
}

// Local embedding using @xenova/transformers (lazy loaded)
let localEmbeddingPipeline: any = null;

async function loadLocalEmbedding() {
  if (!LOCAL_EMBEDDING_ENABLED) return null;
  if (localEmbeddingPipeline) return localEmbeddingPipeline;
  
  try {
    const { pipeline } = await import('@xenova/transformers');
    localEmbeddingPipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    console.log('[EmbeddingService] Local embedding model loaded');
    return localEmbeddingPipeline;
  } catch (e) {
    console.warn('[EmbeddingService] Local embedding model unavailable:', e);
    return null;
  }
}

async function localEmbedding(text: string): Promise<number[]> {
  const pipeline = await loadLocalEmbedding();
  if (!pipeline) throw new Error('Local embedding pipeline not available');
  
  const output = await pipeline(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}

async function hfEmbedding(text: string): Promise<number[]> {
  const requestUrl = `https://api-inference.huggingface.co/models/${HF_EMBEDDING_MODEL}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);
  
  try {
    console.log(`[HF] Requesting embedding from: ${requestUrl}`);
    const fetchFn = await getFetch();
    const response = await fetchFn(
      requestUrl,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: text }),
        signal: controller.signal,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HF API HTTP ${response.status}: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    const flatten = (arr: any[]): number[] => arr.flat(Infinity);
    const embedding = flatten(data);
    
    // Validate dimensions
    if (embedding.length !== EXPECTED_DIMENSIONS) {
      throw new Error(`Unexpected embedding dimensions: ${embedding.length} (expected ${EXPECTED_DIMENSIONS})`);
    }
    
    console.log(`[HF] Generated embedding: ${embedding.length} dimensions`);
    return embedding;
  } catch (error: any) {
    // Detailed error logging
    if (error.name === 'AbortError') {
      console.error('[HF EMBEDDING ERROR] Timeout after 15000ms');
    } else if (error.message?.includes('fetch failed')) {
      console.error('[HF EMBEDDING ERROR] Network error - Hugging Face API unreachable');
    } else if (error.message?.includes('401')) {
      console.error('[HF EMBEDDING ERROR] Authorization failed - check HF_API_KEY');
    } else {
      console.error('[HF EMBEDDING ERROR]', error.message || error);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export class EmbeddingService {
  private mockMode: boolean;
  private useLocal: boolean = false;
  
  constructor() {
    this.mockMode = IS_TEST || !HF_API_KEY && !LOCAL_EMBEDDING_ENABLED;
    
    if (this.mockMode) {
      logger.warn('Using mock embeddings - no embedding service available');
      console.warn('[EmbeddingService] Mock embeddings active - 384 dimensions');
    } else if (LOCAL_EMBEDDING_ENABLED) {
      this.useLocal = true;
      logger.info('Using local embeddings (Xenova/all-MiniLM-L6-v2)');
    } else {
      logger.info(`Using Hugging Face embeddings: ${HF_EMBEDDING_MODEL}`);
    }
  }

  get isRealEmbeddings(): boolean {
    return !this.mockMode;
  }

  get embeddingSource(): string {
    if (this.mockMode) return 'mock';
    if (this.useLocal) return 'local';
    return 'huggingface';
  }

  async generateEmbedding(text: string): Promise<number[]> {
    if (this.mockMode) {
      console.warn('[EmbeddingService] Using mock embedding for:', text.substring(0, 50));
      return this.generateMockEmbedding(text);
    }
    
    // Try local embeddings first if enabled
    if (this.useLocal) {
      try {
        return await localEmbedding(text);
      } catch (e: any) {
        console.error('Local embedding failed, trying Hugging Face:', e.message);
      }
    }
    
    // Try Hugging Face API
    if (HF_API_KEY) {
      try {
        return await hfEmbedding(text);
      } catch (e) {
        console.warn('HF embedding failed, using mock fallback');
      }
    }
    
    // Fallback to mock
    console.warn('All embedding sources failed, using mock');
    return this.generateMockEmbedding(text);
  }

  async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    if (this.mockMode) {
      return texts.map(text => this.generateMockEmbedding(text));
    }
    
    const results: number[][] = [];
    for (const text of texts) {
      try {
        const embedding = await this.generateEmbedding(text);
        results.push(embedding);
      } catch (error: any) {
        logger.error('Embedding failed for text:', {
          error: error.message,
          textPreview: text.substring(0, 30),
        });
        results.push(this.generateMockEmbedding(text));
      }
    }
    return results;
  }

  private generateMockEmbedding(text: string): number[] {
    const hash = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const embedding = new Array(EXPECTED_DIMENSIONS).fill(0).map((_, i) => {
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