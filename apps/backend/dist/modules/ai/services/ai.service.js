"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
const openai_1 = require("openai");
const env_1 = require("../../../config/env");
class AIService {
    constructor() {
        this.openai = new openai_1.OpenAI({ apiKey: env_1.CONFIG.OPENAI_API_KEY });
    }
    async generateResponse(question, chunks) {
        const context = chunks.map((c) => c.text).join('\n\n');
        const completion = await this.openai.chat.completions.create({
            model: env_1.CONFIG.OPENAI_MODEL,
            messages: [
                { role: 'system', content: 'You are a medical AI assistant providing evidence-based answers.' },
                { role: 'user', content: `Question: ${question}\n\nContext:\n${context}` },
            ],
        });
        const summary = completion.choices[0]?.message?.content || '';
        // Extract real citations from chunks metadata
        const citations = [];
        const seenTitles = new Set();
        for (const chunk of chunks) {
            const metadata = chunk.metadata || {};
            const title = metadata.title || metadata.source || 'Unknown Source';
            if (seenTitles.has(title))
                continue;
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
    calculateConfidence(chunks, numCitations) {
        if (numCitations === 0)
            return 0.1;
        const baseScore = Math.min(numCitations / 5, 1) * 0.5;
        const chunkScore = Math.min(chunks.length / 10, 1) * 0.5;
        return Math.round((baseScore + chunkScore) * 100) / 100;
    }
}
exports.AIService = AIService;
//# sourceMappingURL=ai.service.js.map