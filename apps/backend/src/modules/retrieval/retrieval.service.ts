import { PineconeService } from '../rag/services/pinecone.service';
import { EmbeddingService } from '../rag/services/embedding.service';

export class RetrievalService {
  private pineconeService: PineconeService;

  public embeddingService: EmbeddingService;

  private medicalReferenceEmbedding: number[] | null = null;

  constructor() {
    this.pineconeService = new PineconeService();
    this.embeddingService = new EmbeddingService();
    this.initMedicalReferenceEmbedding().catch(() => {});
  }

  private async initMedicalReferenceEmbedding() {
    try {
      this.medicalReferenceEmbedding = await this.embeddingService.generateEmbedding(
        'disease symptoms diagnosis treatment medication malaria hypertension diabetes cancer infection patient medicine healthcare clinical care fever headache asthma pneumonia',
      );
    } catch (e) {
      console.error('[ERROR] Failed to generate medical reference embedding:', e);
      this.medicalReferenceEmbedding = null;
    }
  }

  get pineconeClient() {
    if (this.pineconeService.isMockMode()) {
      return {
        index: () => ({
          query: async () => ({ matches: [] }),
        }),
      };
    }
    return this.pineconeService;
  }

  async semanticSearch(query: string, topK = 10) {
    const embedding = await this.embeddingService.generateEmbedding(query);
    console.log('[PINECONE] Query embedding dimensions:', embedding.length);
    const results = await this.pineconeService.query(embedding, topK);

    console.log('[PINECONE] Matches:', results.length);
    console.log('[PINECONE] Scores:', results.map((m: any) => m.score));

    return results;
  }

  async hybridSearch(query: string, specialty?: string) {
    const pineconeResults = await this.semanticSearch(query);
    let results = pineconeResults;

    if (specialty) {
      const filtered = pineconeResults.filter((match: any) => {
        const metadata = match.metadata || {};
        return metadata.specialty === specialty.toLowerCase() || !metadata.specialty;
      });
      results = filtered.length > 0 ? filtered : pineconeResults;
    }

    return this.rankResults(results);
  }

  private rankResults(results: any[]) {
    return results.sort((a, b) => (b.score || 0) - (a.score || 0));
  }

  async isMedicalQuery(query: string, embeddingService: EmbeddingService): Promise<boolean> {
    const medicalTerms = [
      'malaria',
      'hypertension',
      'diabetes',
      'asthma',
      'pneumonia',
      'stroke',
      'cancer',
      'fever',
      'headache',
      'infection',
      'tuberculosis',
      'covid',
      'heart',
      'blood pressure',
      'pain',
      'symptoms',
      'diagnosis',
      'treatment',
      'medication',
      'disease',
      'patient',
    ];

    const normalized = query.toLowerCase().trim();

    const containsMedicalTerm = medicalTerms.some((term) => normalized.includes(term));

    if (containsMedicalTerm) {
      console.log({ query: normalized, containsMedicalTerm: true, similarity: 'term-match' });
      return true;
    }

    const queryEmbedding = await embeddingService.generateEmbedding(normalized);

    let similarity = 0;
    if (this.medicalReferenceEmbedding) {
      similarity = cosineSimilarity(queryEmbedding, this.medicalReferenceEmbedding);
    }

    console.log({ query: normalized, containsMedicalTerm: false, similarity });

    return similarity >= 0.30;
  }
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Embedding dimensions must match');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) {
    return 0;
  }

  return dotProduct / denominator;
}