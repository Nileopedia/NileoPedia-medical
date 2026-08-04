"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetrievalService = void 0;
const pinecone_service_1 = require("../rag/services/pinecone.service");
const embedding_service_1 = require("../rag/services/embedding.service");
const synonym_service_1 = require("../medical/synonym.service");
const bm25_service_1 = require("../medical/bm25.service");
const dynamic_retrieval_service_1 = require("../medical/dynamic-retrieval.service");
const acronym_resolver_service_1 = require("../medical/acronym-resolver.service");
const cross_encoder_reranker_service_1 = require("./cross-encoder-reranker.service");
const spell_check_service_1 = require("../medical/spell-check.service");
class RetrievalService {
    constructor() {
        this.medicalReferenceEmbedding = null;
        this.pineconeService = new pinecone_service_1.PineconeService();
        this.embeddingService = new embedding_service_1.EmbeddingService();
        this.synonymService = new synonym_service_1.MedicalSynonymService();
        this.bm25Service = new bm25_service_1.Bm25Service();
        this.dynamicRetrievalService = new dynamic_retrieval_service_1.DynamicRetrievalService();
        this.acronymResolver = new acronym_resolver_service_1.MedicalAcronymResolver();
        this.crossEncoderReranker = new cross_encoder_reranker_service_1.CrossEncoderReranker();
        this.spellCheckService = new spell_check_service_1.SpellCheckService();
        this.initMedicalReferenceEmbedding().catch(() => { });
    }
    async initMedicalReferenceEmbedding() {
        try {
            this.medicalReferenceEmbedding = await this.embeddingService.generateEmbedding('disease symptoms diagnosis treatment medication malaria hypertension diabetes cancer infection patient medicine healthcare clinical care fever headache asthma pneumonia');
        }
        catch (e) {
            console.error('[ERROR] Failed to generate medical reference embedding:', e);
            this.medicalReferenceEmbedding = null;
        }
    }
    isMockMode() {
        return this.pineconeService.isMockMode();
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
    async semanticSearch(query, topK = 8) {
        const spellCheck = this.spellCheckService.check(query);
        const correctedQuery = spellCheck.correctedQuery;
        if (spellCheck.corrections.length > 0) {
            console.log('[SPELLCHECK] Original query:', query);
            console.log('[SPELLCHECK] Corrected query:', correctedQuery);
            console.log('[SPELLCHECK] Corrections:', spellCheck.corrections.map(c => `${c.original}->${c.corrected}`).join(', '));
        }
        const acronymExpansion = this.acronymResolver.resolveAll(correctedQuery);
        const expandedQuery = acronymExpansion.expandedQuery;
        console.log('[ACRONYM] Original query:', correctedQuery);
        console.log('[ACRONYM] Expanded query:', expandedQuery);
        console.log('[ACRONYM] Resolved acronyms:', acronymExpansion.acronyms.map(a => a.original).join(', '));
        const expansion = this.synonymService.expand(expandedQuery);
        const finalExpandedQuery = expansion.expandedQuery;
        console.log('[SYNONYM] Original query:', expansion.originalQuery);
        console.log('[SYNONYM] Expanded query:', finalExpandedQuery);
        console.log('[SYNONYM] Matched synonym:', expansion.matchedSynonym);
        const embedding = await this.embeddingService.generateEmbedding(finalExpandedQuery);
        console.log('[PINECONE] Query embedding dimensions:', embedding.length);
        const results = await this.pineconeService.query(embedding, Math.max(topK, 20));
        console.log('[PINECONE] Raw matches:', results.length);
        console.log('[PINECONE] Raw scores:', results.map((m) => m.score));
        const deduped = this.deduplicateResults(results);
        const ranked = this.rerankResults(deduped);
        const topResults = ranked.slice(0, topK).map((r) => ({
            ...r,
            retrievalSource: 'dense',
        }));
        console.log('[PINECONE] After dedup:', deduped.length);
        console.log('[PINECONE] Final results:', topResults.length);
        console.log('[PINECONE] Final scores:', topResults.map((m) => m.score));
        return topResults;
    }
    async hybridSearch(query, specialty, topK = 8) {
        const spellCheck = this.spellCheckService.check(query);
        const correctedQuery = spellCheck.correctedQuery;
        if (spellCheck.corrections.length > 0) {
            console.log('[HYBRID SPELLCHECK] Original query:', query);
            console.log('[HYBRID SPELLCHECK] Corrected query:', correctedQuery);
        }
        const queryAnalysis = this.dynamicRetrievalService.analyzeQuery(correctedQuery);
        const acronymExpansion = this.acronymResolver.resolveAll(correctedQuery);
        const expandedQuery = acronymExpansion.expandedQuery;
        const finalExpandedQuery = this.synonymService.expand(expandedQuery).expandedQuery;
        const denseWeight = queryAnalysis.denseWeight;
        const keywordWeight = queryAnalysis.keywordWeight;
        const denseResults = await this.semanticSearch(finalExpandedQuery, topK * 2);
        const bm25Results = await this.bm25Search(finalExpandedQuery, specialty, topK * 2);
        console.log('[HYBRID] Dense results:', denseResults.length);
        console.log('[HYBRID] Keyword results:', bm25Results.length);
        console.log('[HYBRID] Dynamic weights:', { dense: denseWeight, keyword: keywordWeight });
        const merged = this.mergeResults(denseResults, bm25Results, denseWeight, keywordWeight);
        const topResults = merged.slice(0, topK * 2);
        console.log('[HYBRID] Merged results:', merged.length);
        const reranked = await this.crossEncoderReranker.rerank(query, topResults, topK);
        console.log('[HYBRID] Reranked results:', reranked.length);
        const finalResults = reranked.map((r) => ({
            ...r,
            retrievalSource: 'hybrid',
        }));
        if (specialty) {
            const filtered = finalResults.filter((match) => {
                const metadata = match.metadata || {};
                return metadata.specialty === specialty.toLowerCase() || !metadata.specialty;
            });
            return filtered.length > 0 ? filtered : finalResults;
        }
        return finalResults;
    }
    async bm25Search(query, specialty, topK = 20) {
        try {
            await this.bm25Service.initialize();
            const results = await this.bm25Service.search(query, topK, specialty ? { specialty } : undefined);
            return results.map((r) => ({
                id: r.chunkId,
                score: r.score,
                metadata: r.metadata,
                text: r.text,
                retrievalSource: 'keyword',
            }));
        }
        catch (error) {
            console.error('[BM25] Search failed:', error);
            return [];
        }
    }
    mergeResults(denseResults, keywordResults, denseWeight, keywordWeight) {
        const merged = new Map();
        const normalizeScore = (score, maxScore) => {
            if (maxScore === 0)
                return 0;
            return score / maxScore;
        };
        const denseMax = Math.max(...denseResults.map(r => r.score || 0), 0.01);
        const keywordMax = Math.max(...keywordResults.map(r => r.score || 0), 0.01);
        for (const result of denseResults) {
            const normalizedScore = normalizeScore(result.score || 0, denseMax);
            const finalScore = normalizedScore * denseWeight;
            merged.set(result.id, {
                ...result,
                score: finalScore,
                retrievalSource: 'dense',
            });
        }
        for (const result of keywordResults) {
            const normalizedScore = normalizeScore(result.score || 0, keywordMax);
            const finalScore = normalizedScore * keywordWeight;
            const existing = merged.get(result.id);
            if (existing) {
                existing.score = existing.score + finalScore;
                existing.retrievalSource = 'hybrid';
            }
            else {
                merged.set(result.id, {
                    ...result,
                    score: finalScore,
                    retrievalSource: 'keyword',
                });
            }
        }
        return Array.from(merged.values())
            .sort((a, b) => (b.score || 0) - (a.score || 0));
    }
    deduplicateResults(results) {
        const seen = new Set();
        const unique = [];
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
    rerankResults(results) {
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
    hashText(text) {
        const normalized = text.toLowerCase().replace(/\s+/g, ' ').trim();
        let hash = 0;
        for (let i = 0; i < normalized.length; i++) {
            const char = normalized.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return String(hash);
    }
    buildContext(matches) {
        if (!matches.length) {
            return '';
        }
        const parts = [];
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
    getRetrievalStats(matches) {
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
        const seen = new Set();
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
    async isMedicalQuery(query, embeddingService) {
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
        const spellCheck = this.spellCheckService.check(normalized);
        const correctedQuery = spellCheck.correctedQuery;
        const expansion = this.synonymService.expand(correctedQuery);
        const expandedTerms = expansion.synonyms.map(s => s.toLowerCase());
        const containsMedicalTerm = medicalTerms.some((term) => correctedQuery.includes(term) || expandedTerms.some(s => s.includes(term)));
        if (containsMedicalTerm) {
            console.log({ query: normalized, containsMedicalTerm: true, similarity: 'term-match' });
            return true;
        }
        const queryEmbedding = await embeddingService.generateEmbedding(correctedQuery);
        let similarity = 0;
        if (this.medicalReferenceEmbedding) {
            similarity = cosineSimilarity(queryEmbedding, this.medicalReferenceEmbedding);
        }
        console.log({ query: normalized, containsMedicalTerm: false, similarity });
        return similarity >= 0.30;
    }
}
exports.RetrievalService = RetrievalService;
function cosineSimilarity(a, b) {
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
//# sourceMappingURL=retrieval.service.js.map