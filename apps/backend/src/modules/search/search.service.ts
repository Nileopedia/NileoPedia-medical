import { RetrievalService } from '../retrieval/retrieval.service';
import prisma from '../../config/prisma';
import { SearchType, SearchResult, SearchQuery, SearchResultResponse } from './search.types';

export class SearchService {
  private retrievalService: RetrievalService;

  constructor() {
    this.retrievalService = new RetrievalService();
  }

  async globalSearch(query: SearchQuery): Promise<SearchResultResponse> {
    const { q, type, specialty, limit, page } = query;
    const skip = (page - 1) * limit;

    let results: SearchResult[] = [];

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

  async semanticSearch(q: string, specialty?: string, limit: number = 10): Promise<SearchResult[]> {
    if (!this.retrievalService.pineconeClient) {
      return [];
    }
    const pineconeResults = await this.retrievalService.semanticSearch(q, limit);

    const results: SearchResult[] = [];
    for (const match of pineconeResults) {
      if (match.metadata?.documentId) {
        const doc = await prisma.medicalDocument.findUnique({
          where: { id: match.metadata.documentId as string },
        });
        if (doc && (!specialty || doc.specialty === specialty)) {
          results.push({
            id: match.id,
            title: doc.title,
            snippet: (match.metadata?.textPreview as string) || doc.title,
            source: doc.source || 'Medical Document',
            relevanceScore: match.score || 0,
            specialty: doc.specialty || undefined,
            documentType: doc.documentType || undefined,
          });
        }
      }
    }

    return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  async keywordSearch(q: string, specialty?: string, limit: number = 20): Promise<SearchResult[]> {
    const where: {
      OR?: Array<{ title?: { contains: string; mode: 'insensitive' }; source?: { contains: string; mode: 'insensitive' } }>;
      specialty?: string;
    } = {};

    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { source: { contains: q, mode: 'insensitive' } },
    ];

    if (specialty) where.specialty = specialty;

    const documents = await prisma.medicalDocument.findMany({
      where,
      take: limit,
    });

    return documents.map((doc: { id: string; title: string; description?: string | null; source?: string | null; specialty?: string | null; documentType?: string | null }) => ({
      id: doc.id,
      title: doc.title,
      snippet: doc.description || doc.title,
      source: doc.source || 'Medical Document',
      relevanceScore: 0.8,
      specialty: doc.specialty || undefined,
      documentType: doc.documentType || undefined,
      citationCount: 0,
    }));
  }

  async hybridSearch(q: string, specialty?: string, limit: number = 20): Promise<SearchResult[]> {
    const [semanticResults, keywordResults] = await Promise.all([
      this.semanticSearch(q, specialty, Math.floor(limit * 0.7)),
      this.keywordSearch(q, specialty, Math.floor(limit * 0.3)),
    ]);

    const mergedMap = new Map<string, SearchResult>();
    
    for (const result of semanticResults) {
      result.relevanceScore = (result.relevanceScore || 0) * 0.7;
      mergedMap.set(result.id, result);
    }

    for (const result of keywordResults) {
      const existing = mergedMap.get(result.id);
      if (existing) {
        existing.relevanceScore = ((existing.relevanceScore || 0) + (result.relevanceScore || 0) * 0.3);
      } else {
        result.relevanceScore = (result.relevanceScore || 0) * 0.3;
        mergedMap.set(result.id, result);
      }
    }

    return Array.from(mergedMap.values())
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);
  }

  async searchDocuments(query: SearchQuery) {
    const { q, specialty, limit, page } = query;
    const skip = (page - 1) * limit;

    const where: {
      OR?: Array<{ title?: { contains: string; mode: 'insensitive' }; source?: { contains: string; mode: 'insensitive' } }>;
      specialty?: string;
      documentType?: string;
      publicationYear?: number;
    } = {};

    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { source: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (specialty) where.specialty = specialty;
    if (query.documentType) where.documentType = query.documentType;
    if (query.publicationYear) where.publicationYear = query.publicationYear;

    const [documents, total] = await Promise.all([
      prisma.medicalDocument.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.medicalDocument.count({ where }),
    ]);

    return {
      query: q,
      results: documents.map((doc: { id: string; title: string; description?: string | null; source?: string | null; specialty?: string | null; documentType?: string | null }) => ({
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
      searchType: 'keyword' as SearchType,
    };
  }

  async searchCitations(query: SearchQuery) {
    const { q, limit, page } = query;
    const skip = (page - 1) * limit;

    const where: {
      OR?: Array<{ title?: { contains: string; mode: 'insensitive' }; source?: { contains: string; mode: 'insensitive' } }>;
    } = {};

    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { source: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [citations, total] = await Promise.all([
      prisma.citation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.citation.count({ where }),
    ]);

    return {
      query: q,
      results: citations.map((cit: { id: string; title: string; source: string; specialty?: string | null }) => ({
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
      searchType: 'keyword' as SearchType,
    };
  }
}