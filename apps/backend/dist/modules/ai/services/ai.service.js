"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
const openai_1 = require("openai");
const env_1 = require("../../../config/env");
class AIService {
    constructor() {
        this.openai = new openai_1.OpenAI({ apiKey: env_1.CONFIG.OPENAI_API_KEY });
    }
    async generateResponse(question, documents) {
        const context = documents.map((d) => d.text).join('\n\n');
        const completion = await this.openai.chat.completions.create({
            model: env_1.CONFIG.OPENAI_MODEL,
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
exports.AIService = AIService;
//# sourceMappingURL=ai.service.js.map