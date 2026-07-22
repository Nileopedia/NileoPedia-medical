export interface Bm25Result {
  chunkId: string;
  documentId: string;
  score: number;
  text: string;
  title?: string;
  metadata: Record<string, any>;
}

export interface Bm25Stats {
  totalDocuments: number;
  totalChunks: number;
  averageDocumentLength: number;
  vocabularySize: number;
}

export class Bm25Service {
  private readonly k1 = 1.5;
  private readonly b = 0.75;
  private documentLengths: Map<string, number> = new Map();
  private averageDocumentLength = 0;
  private invertedIndex: Map<string, Set<string>> = new Map();
  private documentTermFrequencies: Map<string, Map<string, number>> = new Map();
  private totalDocuments = 0;
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const { default: prisma } = require('../../config/prisma');
      
      const documents = await prisma.medicalDocument.findMany({
        include: {
          embeddingMetadata: true,
        },
      });

      this.totalDocuments = documents.length;
      
      if (documents.length === 0) {
        this.initialized = true;
        return;
      }

      let totalLength = 0;

      for (const doc of documents) {
        for (const chunk of doc.embeddingMetadata) {
          const text = chunk.chunkText || '';
          const tokens = this.tokenize(text);
          const documentLength = tokens.length;
          
          this.documentLengths.set(chunk.id, documentLength);
          totalLength += documentLength;

          const termFrequencies = new Map<string, number>();
          for (const token of tokens) {
            termFrequencies.set(token, (termFrequencies.get(token) || 0) + 1);
          }
          this.documentTermFrequencies.set(chunk.id, termFrequencies);

          for (const token of tokens) {
            if (!this.invertedIndex.has(token)) {
              this.invertedIndex.set(token, new Set());
            }
            this.invertedIndex.get(token)!.add(chunk.id);
          }
        }
      }

      this.averageDocumentLength = totalLength / documents.length;
      this.initialized = true;
    } catch (error) {
      console.error('[BM25] Initialization failed:', error);
      this.initialized = true;
    }
  }

  async search(query: string, topK = 20, filter?: Record<string, any>): Promise<Bm25Result[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    if (this.totalDocuments === 0) {
      return [];
    }

    const queryTerms = this.tokenize(query);
    const scores = new Map<string, number>();

    for (const term of queryTerms) {
      const postings = this.invertedIndex.get(term);
      if (!postings || postings.size === 0) continue;

      const documentFrequency = postings.size;
      const idf = Math.log((this.totalDocuments - documentFrequency + 0.5) / (documentFrequency + 0.5) + 1);

      for (const chunkId of postings) {
        const termFrequency = this.documentTermFrequencies.get(chunkId)?.get(term) || 0;
        const documentLength = this.documentLengths.get(chunkId) || this.averageDocumentLength;
        
        const numerator = termFrequency * (this.k1 + 1);
        const denominator = termFrequency + this.k1 * (1 - this.b + this.b * (documentLength / this.averageDocumentLength));
        
        const score = idf * (numerator / denominator);
        scores.set(chunkId, (scores.get(chunkId) || 0) + score);
      }
    }

    const ranked = Array.from(scores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, topK);

    let results = await this.enrichResults(ranked);

    if (filter) {
      results = results.filter((r) => {
        for (const [key, value] of Object.entries(filter)) {
          if (r.metadata[key] !== value) return false;
        }
        return true;
      });
    }

    return results;
  }

  private async enrichResults(ranked: [string, number][]): Promise<Bm25Result[]> {
    try {
      const { default: prisma } = require('../../config/prisma');
      const chunkIds = ranked.map(([id]) => id);
      
      const chunks = await prisma.embeddingMetadata.findMany({
        where: { id: { in: chunkIds } },
        include: {
          document: {
            select: {
              title: true,
              specialty: true,
              documentType: true,
              source: true,
            },
          },
        },
      });

      const chunkMap = new Map<string, any>(chunks.map((c: any) => [c.id, c]));

      return ranked.map(([chunkId, score]) => {
        const chunk = chunkMap.get(chunkId);
        if (!chunk) {
          return {
            chunkId,
            documentId: '',
            score,
            text: '',
            metadata: {},
          };
        }

        const metadata: Record<string, any> = {
          title: (chunk as any).document?.title || 'Unknown',
          source: (chunk as any).document?.source || 'Unknown',
          specialty: (chunk as any).document?.specialty || 'general',
          documentType: (chunk as any).document?.documentType || 'Unknown',
        };

        return {
          chunkId,
          documentId: (chunk as any).documentId || '',
          score,
          text: (chunk as any).chunkText || '',
          title: metadata.title,
          metadata,
        };
      });
    } catch (error) {
      console.error('[BM25] Failed to enrich results:', error);
      return ranked.map(([chunkId, score]) => ({
        chunkId,
        documentId: '',
        score,
        text: '',
        metadata: {},
      }));
    }
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 2 && !this.isStopWord(token));
  }

  private isStopWord(token: string): boolean {
    const stopWords = new Set([
      'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her', 'was',
      'one', 'our', 'out', 'has', 'have', 'been', 'had', 'will', 'with', 'this',
      'that', 'these', 'those', 'from', 'they', 'them', 'their', 'what', 'when',
      'where', 'who', 'which', 'while', 'about', 'into', 'through', 'during',
      'before', 'after', 'above', 'below', 'between', 'under', 'again', 'further',
      'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any',
      'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor',
      'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'because',
    ]);
    return stopWords.has(token);
  }

  async getStats(): Promise<Bm25Stats> {
    if (!this.initialized) {
      await this.initialize();
    }

    return {
      totalDocuments: this.totalDocuments,
      totalChunks: this.documentLengths.size,
      averageDocumentLength: Math.round(this.averageDocumentLength),
      vocabularySize: this.invertedIndex.size,
    };
  }

  async reindex(): Promise<void> {
    this.documentLengths.clear();
    this.invertedIndex.clear();
    this.documentTermFrequencies.clear();
    this.totalDocuments = 0;
    this.initialized = false;
    await this.initialize();
  }
}

export const bm25Service = new Bm25Service();
