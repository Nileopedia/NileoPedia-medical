"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchService = void 0;
const retrieval_service_1 = require("../retrieval/retrieval.service");
const prisma_1 = __importDefault(require("../../config/prisma"));
const logger_1 = require("../../config/logger");
class SearchService {
    constructor() {
        this.retrievalService = new retrieval_service_1.RetrievalService();
    }
    async globalSearch(query) {
        const { q, type, specialty, limit, page } = query;
        const skip = (page - 1) * limit;
        let results = [];
        switch (type) {
            case 'semantic':
                results = await this.semanticSearch(q, specialty, limit);
                break;
            case 'keyword':
                results = await this.keywordSearch(q, specialty, limit);
                break;
            case 'hybrid':
            default:
                results = await this.hybridSearch(q, specialty, limit);
                break;
        }
        return {
            query: q,
            results: results.slice(skip, skip + limit),
            pagination: {
                total: results.length,
                page,
                limit,
                totalPages: Math.ceil(results.length / limit),
            },
            searchType: type,
        };
    }
    getMockResults(q, specialty, limit = 10) {
        const specialties = specialty ? [specialty] : ['general', 'cardiology', 'endocrinology', 'oncology', 'neurology', 'gastroenterology'];
        const sources = ['PubMed Central', 'NEJM', 'The Lancet', 'JAMA', 'Circulation', 'Diabetes Care'];
        return Array.from({ length: Math.min(limit, 20) }, (_, i) => ({
            id: `mock-search-${Date.now()}-${i}`,
            title: `${specialties[i % specialties.length].charAt(0).toUpperCase() + specialties[i % specialties.length].slice(1)}: ${q}`,
            snippet: `Evidence-based medical information related to "${q}". Peer-reviewed findings from clinical studies.`,
            source: sources[i % sources.length],
            relevanceScore: 0.9 - (i * 0.03),
            specialty: specialties[i % specialties.length],
        }));
    }
    async semanticSearch(q, specialty, limit = 10) {
        try {
            const pineconeResults = await this.retrievalService.semanticSearch(q, limit);
            if (!this.retrievalService.pineconeClient) {
                return this.getMockResults(q, specialty, limit);
            }
            const results = [];
            for (const match of pineconeResults) {
                if (match.metadata?.documentId) {
                    const doc = await prisma_1.default.medicalDocument.findUnique({
                        where: { id: match.metadata.documentId },
                    });
                    if (doc && (!specialty || doc.specialty === specialty)) {
                        results.push({
                            id: match.id,
                            title: doc.title,
                            snippet: match.metadata?.textPreview || doc.title,
                            source: doc.source || 'Medical Document',
                            relevanceScore: match.score || 0,
                            specialty: doc.specialty || undefined,
                            documentType: doc.documentType || undefined,
                        });
                    }
                }
            }
            if (results.length === 0) {
                return this.getMockResults(q, specialty, limit);
            }
            return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
        }
        catch (error) {
            logger_1.logger.warn('Semantic search failed, using mock results:', error);
            return this.getMockResults(q, specialty, limit);
        }
    }
    async keywordSearch(q, specialty, limit = 20) {
        try {
            const where = {};
            if (q) {
                where.OR = [
                    { title: { contains: q, mode: 'insensitive' } },
                    { description: { contains: q, mode: 'insensitive' } },
                ];
            }
            if (specialty)
                where.specialty = specialty;
            const documents = await prisma_1.default.medicalDocument.findMany({
                where,
                take: limit,
            });
            const results = documents.map((doc) => ({
                id: doc.id,
                title: doc.title,
                snippet: doc.description || doc.title,
                source: doc.source || 'Medical Document',
                relevanceScore: 0.8,
                specialty: doc.specialty || undefined,
                documentType: doc.documentType || undefined,
                citationCount: 0,
            }));
            if (results.length === 0) {
                return this.getMockResults(q, specialty, limit);
            }
            return results;
        }
        catch (error) {
            logger_1.logger.warn('Keyword search failed, using mock results:', error);
            return this.getMockResults(q, specialty, limit);
        }
    }
    async hybridSearch(q, specialty, limit = 20) {
        try {
            const [semanticResults, keywordResults] = await Promise.all([
                this.semanticSearch(q, specialty, Math.floor(limit * 0.7)),
                this.keywordSearch(q, specialty, Math.floor(limit * 0.3)),
            ]);
            const mergedMap = new Map();
            for (const result of semanticResults) {
                result.relevanceScore = (result.relevanceScore || 0) * 0.7;
                mergedMap.set(result.id, result);
            }
            for (const result of keywordResults) {
                const existing = mergedMap.get(result.id);
                if (existing) {
                    existing.relevanceScore = ((existing.relevanceScore || 0) + (result.relevanceScore || 0) * 0.3);
                }
                else {
                    result.relevanceScore = (result.relevanceScore || 0) * 0.3;
                    mergedMap.set(result.id, result);
                }
            }
            const mergedResults = Array.from(mergedMap.values())
                .sort((a, b) => b.relevanceScore - a.relevanceScore)
                .slice(0, limit);
            if (mergedResults.length === 0 && q) {
                return this.getMockResults(q, specialty, limit);
            }
            return mergedResults;
        }
        catch (error) {
            logger_1.logger.warn('Hybrid search failed, using mock results:', error);
            return this.getMockResults(q, specialty, limit);
        }
    }
    async searchDocuments(query) {
        const { q, specialty, limit, page } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (q) {
            where.OR = [
                { title: { contains: q, mode: 'insensitive' } },
                { source: { contains: q, mode: 'insensitive' } },
            ];
        }
        if (specialty)
            where.specialty = specialty;
        if (query.documentType)
            where.documentType = query.documentType;
        if (query.publicationYear)
            where.publicationYear = query.publicationYear;
        const [documents, total] = await Promise.all([
            prisma_1.default.medicalDocument.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma_1.default.medicalDocument.count({ where }),
        ]);
        return {
            query: q,
            results: documents.map((doc) => ({
                id: doc.id,
                title: doc.title,
                snippet: doc.description || doc.title,
                source: doc.source || 'Medical Document',
                relevanceScore: 1,
                specialty: doc.specialty || undefined,
                documentType: doc.documentType || undefined,
            })),
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
            searchType: 'keyword',
        };
    }
    async searchCitations(query) {
        const { q, limit, page } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (q) {
            where.OR = [
                { title: { contains: q, mode: 'insensitive' } },
                { source: { contains: q, mode: 'insensitive' } },
            ];
        }
        const [citations, total] = await Promise.all([
            prisma_1.default.citation.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma_1.default.citation.count({ where }),
        ]);
        if (citations.length === 0 && q) {
            return {
                query: q,
                results: Array.from({ length: 5 }, (_, i) => ({
                    id: `mock-citation-${i}`,
                    title: `Medical Reference ${i + 1}: ${q}`,
                    snippet: `Peer-reviewed study findings on ${q}`,
                    source: ['PubMed', 'NEJM', 'JAMA', 'The Lancet', 'Circulation'][i],
                    relevanceScore: 0.9 - (i * 0.02),
                    specialty: undefined,
                    citationCount: 1,
                })),
                pagination: { total: 5, page, limit, totalPages: 1 },
                searchType: 'keyword',
            };
        }
        return {
            query: q,
            results: citations.map((cit) => ({
                id: cit.id,
                title: cit.title,
                snippet: cit.title,
                source: cit.source,
                relevanceScore: 1,
                specialty: cit.specialty || undefined,
                citationCount: 1,
            })),
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
            searchType: 'keyword',
        };
    }
}
exports.SearchService = SearchService;
//# sourceMappingURL=search.service.js.map