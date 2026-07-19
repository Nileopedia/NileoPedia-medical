import { EmbeddingService } from './embedding.service';
import { CONFIG } from '../../../config/env';

export interface DocumentChunk {
  text: string;
  chunkIndex: number;
  chunkId: string;
  metadata: Record<string, any>;
}

interface ChunkOptions {
  documentId?: string;
  title?: string;
  source?: string;
  specialty?: string;
  documentType?: string;
  publicationYear?: number;
  authors?: string[];
  journal?: string;
  publisher?: string;
  doi?: string;
  isbn?: string;
  pmid?: string;
  pmcid?: string;
  institution?: string;
  country?: string;
  keywords?: string[];
  language?: string;
  sourceURL?: string;
  pageNumber?: number;
}

const MIN_CHUNK_SIZE = 250;
const MAX_CHUNK_SIZE = 1000;
const TARGET_CHUNK_SIZE = 700;
const OVERLAP_SIZE = 150;

function sha256(text: string): string {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(text).digest('hex');
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
}

function splitIntoParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}

function splitIntoSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function isTableLike(text: string): boolean {
  const tableIndicators = ['|', '---', '===', 'TABLE', 'Table '];
  return tableIndicators.some((indicator) => text.includes(indicator));
}

function isFigureCaption(text: string): boolean {
  return /^(Figure|Fig\.|Figure \d+)[:\s]/i.test(text.trim());
}

function isMedicationDosage(text: string): boolean {
  return /\d+\s*(mg|mcg|g|ml|mg\/kg|mcg\/kg|units?|IU)/i.test(text);
}

function shouldKeepSmallChunk(text: string): boolean {
  const trimmed = text.trim();
  if (isTableLike(trimmed)) return true;
  if (isFigureCaption(trimmed)) return true;
  if (isMedicationDosage(trimmed)) return true;
  if (trimmed.length >= MIN_CHUNK_SIZE) return true;
  return false;
}

export class ChunkingService {
  private embeddingService: EmbeddingService;

  constructor() {
    this.embeddingService = new EmbeddingService();
  }

  chunkDocument(content: string, options: ChunkOptions = {}): DocumentChunk[] {
    const paragraphs = splitIntoParagraphs(content);
    const chunks: DocumentChunk[] = [];
    let currentChunk = '';
    let chunkIndex = 0;

    const documentId = options.documentId || 'doc';
    const baseMetadata: Record<string, any> = {
      documentId,
      title: options.title || 'Unknown',
      source: options.source || 'Unknown',
      specialty: options.specialty || 'general',
      documentType: options.documentType || 'Unknown',
      publicationYear: options.publicationYear,
      authors: options.authors || [],
      journal: options.journal,
      publisher: options.publisher,
      doi: options.doi,
      isbn: options.isbn,
      pmid: options.pmid,
      pmcid: options.pmcid,
      institution: options.institution,
      country: options.country,
      keywords: options.keywords || [],
      language: options.language || 'en',
      sourceURL: options.sourceURL,
      pageNumber: options.pageNumber,
    };

    for (const paragraph of paragraphs) {
      const candidate = currentChunk ? `${currentChunk}\n\n${paragraph}` : paragraph;

      if (candidate.length > MAX_CHUNK_SIZE && currentChunk.length >= TARGET_CHUNK_SIZE) {
        if (shouldKeepSmallChunk(currentChunk)) {
          const chunkId = `${documentId}_chunk_${chunkIndex}`;
          chunks.push({
            text: currentChunk.trim(),
            chunkIndex,
            chunkId,
            metadata: {
              ...baseMetadata,
              chunkId,
              chunkIndex,
              text: currentChunk.trim(),
            },
          });
          chunkIndex++;
        }

        const overlapText = currentChunk.slice(-OVERLAP_SIZE);
        currentChunk = `${overlapText}\n\n${paragraph}`;
      } else if (candidate.length <= MAX_CHUNK_SIZE) {
        currentChunk = candidate;
      } else {
        if (shouldKeepSmallChunk(currentChunk)) {
          const chunkId = `${documentId}_chunk_${chunkIndex}`;
          chunks.push({
            text: currentChunk.trim(),
            chunkIndex,
            chunkId,
            metadata: {
              ...baseMetadata,
              chunkId,
              chunkIndex,
              text: currentChunk.trim(),
            },
          });
          chunkIndex++;
        }
        currentChunk = paragraph;
      }
    }

    if (currentChunk.trim() && shouldKeepSmallChunk(currentChunk)) {
      const chunkId = `${documentId}_chunk_${chunkIndex}`;
      chunks.push({
        text: currentChunk.trim(),
        chunkIndex,
        chunkId,
        metadata: {
          ...baseMetadata,
          chunkId,
          chunkIndex,
          text: currentChunk.trim(),
        },
      });
    }

    return chunks;
  }

  async generateEmbeddings(chunks: DocumentChunk[]): Promise<Array<{ embedding: number[]; chunk: DocumentChunk }>> {
    const texts = chunks.map((c) => c.text);
    const embeddings = await this.embeddingService.generateBatchEmbeddings(texts);

    return embeddings.map((embedding, i) => ({
      embedding,
      chunk: chunks[i],
    }));
  }

  async deduplicateChunks(chunks: DocumentChunk[], similarityThreshold = 0.97): Promise<DocumentChunk[]> {
    if (chunks.length <= 1) return chunks;

    const seenHashes = new Set<string>();
    const uniqueChunks: DocumentChunk[] = [];
    const embeddings = await this.embeddingService.generateBatchEmbeddings(chunks.map((c) => c.text));

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const textHash = sha256(chunk.text);

      if (seenHashes.has(textHash)) {
        continue;
      }

      let isDuplicate = false;
      for (let j = 0; j < uniqueChunks.length; j++) {
        const existingChunk = chunks[chunks.indexOf(uniqueChunks[j])];
        if (existingChunk) {
          const similarity = cosineSimilarity(embeddings[i], embeddings[chunks.indexOf(existingChunk)]);
          if (similarity > similarityThreshold) {
            isDuplicate = true;
            break;
          }
        }
      }

      if (!isDuplicate) {
        seenHashes.add(textHash);
        uniqueChunks.push(chunk);
      }
    }

    return uniqueChunks;
  }
}
