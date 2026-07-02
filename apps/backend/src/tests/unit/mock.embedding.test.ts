/* eslint-env jest */
import { MockEmbeddingProvider } from '../../modules/rag/services/mock.embedding';

describe('MockEmbeddingProvider', () => {
  let provider: MockEmbeddingProvider;

  beforeEach(() => {
    provider = new MockEmbeddingProvider();
  });

  it('should have embeddingSource property', () => {
    expect(provider.embeddingSource).toBe('mock');
  });

  it('should generate 384-dim embeddings', async () => {
    const emb = await provider.generateEmbedding('test');
    expect(emb.length).toBe(384);
  });

  it('should generate deterministic embeddings', async () => {
    const e1 = await provider.generateEmbedding('test');
    const e2 = await provider.generateEmbedding('test');
    expect(e1).toEqual(e2);
  });

  it('should generate different embeddings for different text', async () => {
    const e1 = await provider.generateEmbedding('test1');
    const e2 = await provider.generateEmbedding('test2');
    const same = e1.every((v, i) => v === e2[i]);
    expect(same).toBe(false);
  });

  it('should handle batch embeddings', async () => {
    const results = await provider.generateBatchEmbeddings(['a', 'b', 'c']);
    expect(results.length).toBe(3);
    expect(results[0].length).toBe(384);
  });
});
