"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
const groq_sdk_1 = require("groq-sdk");
const env_1 = require("../../../config/env");
class AIService {
    constructor() {
        this.groq = null;
        if (env_1.CONFIG.GROQ_API_KEY) {
            this.groq = new groq_sdk_1.Groq({ apiKey: env_1.CONFIG.GROQ_API_KEY });
        }
    }
    async generateResponse(question, chunks) {
        const context = chunks.map((c) => c.text).join('\n\n');
        if (!this.groq) {
            throw new Error('Groq API unavailable');
        }
        const completion = await this.groq.chat.completions.create({
            model: env_1.CONFIG.GROQ_MODEL,
            messages: [
                { role: 'system', content: 'You are a medical retrieval assistant.\n\nRules:\n- Use ONLY information provided in CONTEXT.\n- Never use your own knowledge.\n- Never invent facts.\n- If context is insufficient, reply exactly: "I could not find supporting medical information in the knowledge base."' },
                { role: 'user', content: `CONTEXT:\n${context}\n\nQUESTION:\n${question}` },
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