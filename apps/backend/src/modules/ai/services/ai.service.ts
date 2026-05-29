import { OpenAI } from 'openai';
import { CONFIG } from '../../../config/env';

export class AIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({ apiKey: CONFIG.OPENAI_API_KEY });
  }

  async generateResponse(question: string, documents: string[]) {
    const context = documents.map((d: any) => d.text).join('\n\n');
    
    const completion = await this.openai.chat.completions.create({
      model: CONFIG.OPENAI_MODEL,
      messages: [
        { role: 'system', content: 'You are a medical AI assistant providing evidence-based answers.' },
        { role: 'user', content: `Question: ${question}\n\nContext:\n${context}` },
      ],
    });

    const summary = completion.choices[0]?.message?.content || '';
    
    // Mock citations - would be extracted from context
    const citations = [
      { title: 'Medical Source 1', source: 'Journal of Medicine', year: 2024, authors: 'Medical Authors' },
    ];

    return {
      summary,
      citations,
      confidenceScore: 0.92,
    };
  }
}