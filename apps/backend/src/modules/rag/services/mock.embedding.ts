export class MockEmbeddingProvider {
  embeddingSource = 'mock';
  private EXPECTED_DIMENSIONS = 384;

  async generateEmbedding(text: string): Promise<number[]> {
    const hash = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const embedding = new Array(this.EXPECTED_DIMENSIONS).fill(0).map((_, i) => {
      const seed = (hash * (i + 1)) % 1000;
      return (seed - 500) / 500;
    });
    return embedding;
  }

  async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map(t => this.generateEmbedding(t)));
  }
}