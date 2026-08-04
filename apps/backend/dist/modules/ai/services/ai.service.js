"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
const groq_sdk_1 = require("groq-sdk");
const env_1 = require("../../../config/env");
const confidence_engine_service_1 = require("../../medical/confidence-engine.service");
const citation_quality_service_1 = require("../../medical/citation-quality.service");
class AIService {
    constructor() {
        this.groq = null;
        if (env_1.CONFIG.GROQ_API_KEY) {
            this.groq = new groq_sdk_1.Groq({ apiKey: env_1.CONFIG.GROQ_API_KEY });
        }
        this.confidenceEngine = new confidence_engine_service_1.ConfidenceEngine();
        this.citationQualityService = new citation_quality_service_1.CitationQualityService();
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
        const citations = [];
        const seenTitles = new Set();
        const citationQualityScores = [];
        for (const chunk of chunks) {
            const metadata = chunk.metadata || {};
            const title = metadata.title || metadata.source || 'Unknown Source';
            if (seenTitles.has(title))
                continue;
            seenTitles.add(title);
            const qualityResult = this.citationQualityService.evaluate(metadata.source || '', metadata.documentType, metadata.authors ? (Array.isArray(metadata.authors) ? metadata.authors : [metadata.authors]) : undefined);
            citationQualityScores.push(qualityResult.qualityScore);
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
        const confidenceResult = this.confidenceEngine.calculate({
            topSimilarity: chunks[0]?.metadata?.score || 0,
            retrievedCount: chunks.length,
            rerankerScores: chunks.map((c) => c.metadata?.score || 0),
            citationQualityScores,
            metadataCompleteness: this.computeMetadataCompleteness(chunks),
            sourceDiversity: new Set(chunks.map((c) => c.metadata?.source)).size / Math.max(chunks.length, 1),
        });
        return {
            summary,
            citations,
            confidenceScore: confidenceResult.confidenceScore / 100,
            evidenceStrength: confidenceResult.evidenceStrength,
            retrievalQuality: confidenceResult.retrievalQuality,
            breakdown: confidenceResult.breakdown,
        };
    }
    computeMetadataCompleteness(chunks) {
        if (chunks.length === 0)
            return 0;
        const fields = ['title', 'authors', 'journal', 'publicationYear', 'doi', 'source'];
        let total = 0;
        let filled = 0;
        for (const chunk of chunks) {
            for (const field of fields) {
                total++;
                const value = chunk.metadata?.[field];
                if (value && value !== 'unknown' && value !== 'Unknown' && value !== 'N/A') {
                    filled++;
                }
            }
        }
        return total > 0 ? (filled / total) * 100 : 0;
    }
}
exports.AIService = AIService;
//# sourceMappingURL=ai.service.js.map