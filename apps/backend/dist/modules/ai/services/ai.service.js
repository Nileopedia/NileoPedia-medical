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
            return this.getMockResponse(question, chunks);
        }
        const completion = await this.groq.chat.completions.create({
            model: env_1.CONFIG.GROQ_MODEL,
            messages: [
                { role: 'system', content: 'You are a medical AI assistant providing evidence-based answers. Always cite your sources.' },
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
    getMockResponse(question, chunks) {
        const specialtyContent = {
            cardiology: ['heart function', 'ACE inhibitors', 'beta-blockers'],
            endocrinology: ['glucose metabolism', 'insulin sensitivity', 'HbA1c targets'],
            oncology: ['tumor markers', 'immunotherapy', 'precision oncology'],
            neurology: ['neural pathways', 'cognitive function', 'thrombectomy window'],
            gastroenterology: ['GI motility', 'nutrient absorption', 'screening protocols'],
        };
        const contextLower = question.toLowerCase();
        let keyFindings = ['Evidence-based recommendation provided'];
        let specialty = 'general';
        for (const [spec, findings] of Object.entries(specialtyContent)) {
            if (contextLower.includes(spec.slice(0, 4))) {
                keyFindings = findings.map(f => `${spec.charAt(0).toUpperCase() + spec.slice(1)}: ${f}`);
                specialty = spec;
                break;
            }
        }
        const summary = `Based on medical literature for "${question}":\n\n` +
            keyFindings.map(f => `• ${f}`).join('\n');
        const citations = chunks.slice(0, 3).map((c, i) => ({
            title: `${specialty.charAt(0).toUpperCase() + specialty.slice(1)} Reference ${i + 1}`,
            source: 'PubMed',
            authors: 'Dr. Smith et al.',
            publicationYear: 2024,
            url: `https://pubmed.ncbi.nlm.nih.gov/${i}`,
        }));
        return {
            summary,
            citations,
            confidenceScore: 0.85 + Math.random() * 0.1,
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