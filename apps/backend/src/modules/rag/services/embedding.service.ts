import { CONFIG } from '../../../config/env';
import { logger } from '../../../config/logger';

let fetch: any;
async function getFetch() {
  if (!fetch) {
    fetch = (await import('node-fetch')).default || (await import('node-fetch'));
  }
  return fetch;
}

const { HF_API_KEY } = CONFIG;
const { HF_EMBEDDING_MODEL } = CONFIG;
const EXPECTED_DIMENSIONS = 384;
const IS_TEST = process.env.NODE_ENV === 'test';
const LOCAL_EMBEDDING_ENABLED = process.env.LOCAL_EMBEDDINGS !== 'false' && !IS_TEST;

console.log('[EmbeddingService] Configuration check:', {
  HF_API_KEY_EXISTS: !!HF_API_KEY,
  HF_API_KEY_LENGTH: HF_API_KEY?.length || 0,
  HF_EMBEDDING_MODEL,
  USE_MOCK_EMBEDDINGS: CONFIG.USE_MOCK_EMBEDDINGS,
  LOCAL_EMBEDDINGS_ENABLED: LOCAL_EMBEDDING_ENABLED,
});

if (CONFIG.USE_MOCK_EMBEDDINGS) {
  console.warn('[EmbeddingService] WARNING: USE_MOCK_EMBEDDINGS=true - mock embeddings will be used');
}

let localEmbeddingPipeline: any = null;

async function loadLocalEmbedding() {
  if (!LOCAL_EMBEDDING_ENABLED) return null;
  if (localEmbeddingPipeline) return localEmbeddingPipeline;

  try {
    const { pipeline } = await import('@xenova/transformers');
    localEmbeddingPipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    console.log('[STARTUP] Embedding model loaded');
    return localEmbeddingPipeline;
  } catch (e) {
    console.error('[ERROR] Local embedding model unavailable:', e);
    return null;
  }
}

export async function preloadEmbeddingModel(): Promise<void> {
  if (!LOCAL_EMBEDDING_ENABLED) {
    console.log('[STARTUP] Skipping embedding preload (local embeddings disabled)');
    return;
  }
  try {
    await loadLocalEmbedding();
  } catch (e) {
    console.error('[STARTUP] Failed to preload embedding model:', e);
  }
}

async function localEmbedding(text: string): Promise<number[]> {
  const pipeline = await loadLocalEmbedding();
  if (!pipeline) {
    logger.error('[ERROR] Pinecone unavailable');
    throw new Error('Embedding service unavailable');
  }

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
          Authorization: `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: text }),
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HF API HTTP ${response.status}: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    const flatten = (arr: any[]): number[] => arr.flat(Infinity);
    const embedding = flatten(data);

    if (embedding.length !== EXPECTED_DIMENSIONS) {
      throw new Error(`Unexpected embedding dimensions: ${embedding.length} (expected ${EXPECTED_DIMENSIONS})`);
    }

    console.log(`[HF] Generated embedding: ${embedding.length} dimensions`);
    return embedding;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('[ERROR] Embedding service unavailable');
    } else if (error.message?.includes('fetch failed')) {
      console.error('[ERROR] Embedding service unavailable');
    } else if (error.message?.includes('401')) {
      console.error('[ERROR] Embedding service unavailable');
    } else {
      console.error('[ERROR] Embedding service unavailable:', error.message || error);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

function generateMockEmbedding(text: string): number[] {
  const seed = text.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
  const embedding: number[] = [];
  const keywords = [
    'blood', 'pressure', 'hypertension', 'heart', 'cardiovascular',
    'symptom', 'diagnosis', 'treatment', 'medicine', 'disease',
    'patient', 'clinical', 'medical', 'health', 'care',
  ];

  for (let i = 0; i < EXPECTED_DIMENSIONS; i++) {
    let val = 0;
    for (const word of seed) {
      let hash = 0;
      for (let j = 0; j < word.length; j++) {
        hash = ((hash << 5) - hash + word.charCodeAt(j)) & 0xffffffff;
      }
      const keywordMatch = keywords.some((k) => word.includes(k));
      val += keywordMatch ? (hash % 100) / 100 : (hash % 50) / 50;
    }
    val = val / seed.length;
    embedding.push(Math.max(-1, Math.min(1, val)));
  }

  const norm = Math.sqrt(embedding.reduce((sum, v) => sum + v * v, 0));
  return embedding.map((v) => (norm > 0 ? v / norm : 0));
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

    logger.info({
      localEnabled: CONFIG.LOCAL_EMBEDDINGS_ENABLED,
      hfConfigured: !!CONFIG.HF_API_KEY,
    });
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
    if (CONFIG.USE_MOCK_EMBEDDINGS && this.mockMode) {
      return generateMockEmbedding(text);
    }

    if (LOCAL_EMBEDDING_ENABLED) {
      try {
        logger.info('Attempting local embeddings...');
        const localResult = await localEmbedding(text);
        logger.info('Embedding source: local');
        return localResult;
      } catch (error) {
        logger.warn('Local embedding failed, falling back to mock:', error);
        return generateMockEmbedding(text);
      }
    }

    if (HF_API_KEY) {
      try {
        logger.info('Attempting HF embeddings...');
        const hfResult = await hfEmbedding(text);
        logger.info('Embedding source: huggingface');
        return hfResult;
      } catch (error) {
        logger.warn('HF embedding failed, falling back to mock:', error);
        return generateMockEmbedding(text);
      }
    }

    logger.error('No embedding provider available, using mock');
    return generateMockEmbedding(text);
  }

  async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    if (this.mockMode) {
      const results: number[][] = [];
      for (const text of texts) {
        results.push(generateMockEmbedding(text));
      }
      return results;
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
        throw error;
      }
    }
    return results;
  }

  async preprocessText(text: string): Promise<string> {
    let cleaned = text.replace(/\s+/g, ' ').trim();
    cleaned = cleaned.replace(/[^\x00-\x7F]/g, '');
    return cleaned;
  }
}