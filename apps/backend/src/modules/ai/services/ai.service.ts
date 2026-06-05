import { OpenAI } from 'openai';
import { CONFIG } from '../../../config/env';

export interface Citation {
  title: string;
  source: string;
  authors?: string;
  publicationYear?: number;
  doi?: string;
  url?: string;
  pageNumber?: number;
  sectionTitle?: string;
}

export class AIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({ apiKey: CONFIG.OPENAI_API_KEY });
  }

  async generateResponse(question: string, chunks: Array<{ text: string; metadata?: Record<string, any> }>) {
    const context = chunks.map((c) => c.text).join('\n\n');

    const completion = await this.openai.chat.completions.create({
      model: CONFIG.OPENAI_MODEL,
      messages: [
        { role: 'system', content: 'You are a medical AI assistant providing evidence-based answers.' },
        { role: 'user', content: `Question: ${question}\n\nContext:\n${context}` },
      ],
    });

    const summary = completion.choices[0]?.message?.content || '';

    // Extract real citations from chunks metadata
    const citations: Citation[] = [];
    const seenTitles = new Set<string>();

    for (const chunk of chunks) {
      const metadata = chunk.metadata || {};
      const title = metadata.title || metadata.source || 'Unknown Source';

      if (seenTitles.has(title)) continue;
      seenTitles.add(title);

      citations.push({
        title,
        source: metadata.source || '',
        authors: metadata.authors,
        publicationYear: metadata.publicationYear,
        doi: metadata.doi,
        url: metadata.url,
        pageNumber: metadata.pageNumber,
        sectionTitle: metadata.sectionTitle,
      });
    }

    return {
      summary,
      citations,
      confidenceScore: this.calculateConfidence(chunks, citations.length),
    };
  }

  private calculateConfidence(chunks: Array<any>, numCitations: number): number {
    if (numCitations === 0) return 0.1;
    const baseScore = Math.min(numCitations / 5, 1) * 0.5;
    const chunkScore = Math.min(chunks.length / 10, 1) * 0.5;
    return Math.round((baseScore + chunkScore) * 100) / 100;
  }
}