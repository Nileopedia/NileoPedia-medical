import { PineconeService } from '../rag/services/pinecone.service';
import { EmbeddingService } from '../rag/services/embedding.service';
import { DocumentChunk } from '../rag/services/chunking.service';

export interface RetrievalMatch {
  id: string;
  score: number;
  metadata: Record<string, any>;
  text?: string;
}

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

  async semanticSearch(query: string, topK = 8): Promise<RetrievalMatch[]> {
    const embedding = await this.embeddingService.generateEmbedding(query);
    console.log('[PINECONE] Query embedding dimensions:', embedding.length);
    const results = await this.pineconeService.query(embedding, Math.max(topK, 20));

    console.log('[PINECONE] Raw matches:', results.length);
    console.log('[PINECONE] Raw scores:', results.map((m: any) => m.score));

    const deduped = this.deduplicateResults(results);
    const ranked = this.rerankResults(deduped);
    const topResults = ranked.slice(0, topK);

    console.log('[PINECONE] After dedup:', deduped.length);
    console.log('[PINECONE] Final results:', topResults.length);
    console.log('[PINECONE] Final scores:', topResults.map((m) => m.score));

    return topResults;
  }

  async hybridSearch(query: string, specialty?: string): Promise<RetrievalMatch[]> {
    const pineconeResults = await this.semanticSearch(query);
    let results = pineconeResults;

    if (specialty) {
      const filtered = pineconeResults.filter((match) => {
        const metadata = match.metadata || {};
        return metadata.specialty === specialty.toLowerCase() || !metadata.specialty;
      });
      results = filtered.length > 0 ? filtered : pineconeResults;
    }

    return results;
  }

  private deduplicateResults(results: any[]): any[] {
    const seen = new Set<string>();
    const unique: any[] = [];

    for (const result of results) {
      const text = result.metadata?.text || result.metadata?.textPreview || '';
      const hash = this.hashText(text);

      if (seen.has(hash)) {
        continue;
      }

      seen.add(hash);
      unique.push(result);
    }

    return unique;
  }

  private rerankResults(results: any[]): any[] {
    return results.sort((a, b) => {
      const scoreDiff = (b.score || 0) - (a.score || 0);
      if (Math.abs(scoreDiff) > 0.01) {
        return scoreDiff;
      }

      const aLength = (a.metadata?.text || a.metadata?.textPreview || '').length;
      const bLength = (b.metadata?.text || b.metadata?.textPreview || '').length;
      return bLength - aLength;
    });
  }

  private hashText(text: string): string {
    const normalized = text.toLowerCase().replace(/\s+/g, ' ').trim();
    let hash = 0;
    for (let i = 0; i < normalized.length; i++) {
      const char = normalized.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return String(hash);
  }

  buildContext(matches: any[]): string {
    if (!matches.length) {
      return '';
    }

    const parts: string[] = [];
    for (const match of matches) {
      const metadata = match.metadata || {};
      const title = metadata.title || metadata.source || 'Unknown Document';
      const authors = metadata.authors?.join(', ') || 'Unknown Authors';
      const journal = metadata.journal || '';
      const year = metadata.publicationYear || metadata.year || 'Unknown';
      const text = metadata.text || metadata.textPreview || '';

      parts.push(`# ${title}\nAuthors: ${authors}${journal ? `\nJournal: ${journal}` : ''}\nYear: ${year}\n\n${text}\n\n${'---'.repeat(40)}`);
    }

    return parts.join('\n\n');
  }

  getRetrievalStats(matches: any[]): {
    totalCount: number;
    avgLength: number;
    duplicateCount: number;
    metadataCompleteness: number;
  } {
    if (!matches.length) {
      return {
        totalCount: 0,
        avgLength: 0,
        duplicateCount: 0,
        metadataCompleteness: 0,
      };
    }

    const texts = matches.map((m) => m.metadata?.text || m.metadata?.textPreview || '');
    const avgLength = Math.round(texts.reduce((sum, t) => sum + t.length, 0) / texts.length);

    const seen = new Set<string>();
    let duplicateCount = 0;
    for (const text of texts) {
      const hash = this.hashText(text);
      if (seen.has(hash)) {
        duplicateCount++;
      }
      seen.add(hash);
    }

    let metadataFields = 0;
    let filledFields = 0;
    for (const match of matches) {
      const metadata = match.metadata || {};
      const fields = ['title', 'authors', 'journal', 'publicationYear', 'doi', 'source'];
      for (const field of fields) {
        metadataFields++;
        if (metadata[field] && metadata[field] !== 'unknown' && metadata[field] !== 'Unknown') {
          filledFields++;
        }
      }
    }

    const metadataCompleteness = metadataFields > 0 ? Math.round((filledFields / metadataFields) * 100) : 0;

    return {
      totalCount: matches.length,
      avgLength,
      duplicateCount,
      metadataCompleteness,
    };
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
      'bloodpressure',
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
