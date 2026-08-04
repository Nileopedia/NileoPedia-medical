import { SearchType, SearchResult, SearchQuery, SearchResultResponse } from './search.types';
export interface SearchErrorResponse {
    success: false;
    error: string;
}
export declare class SearchService {
    private retrievalService;
    private dynamicRetrievalService;
    private spellCheckService;
    constructor();
    globalSearch(query: SearchQuery): Promise<SearchResultResponse | SearchErrorResponse>;
    semanticSearch(q: string, specialty?: string, limit?: number): Promise<SearchResult[]>;
    keywordSearch(q: string, specialty?: string, limit?: number): Promise<SearchResult[]>;
    hybridSearch(q: string, specialty?: string, limit?: number): Promise<SearchResult[]>;
    searchDocuments(query: SearchQuery): Promise<{
        query: string;
        results: {
            id: string;
            title: string;
            snippet: string;
            source: string;
            relevanceScore: number;
            specialty: string | undefined;
            documentType: string | undefined;
        }[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
        searchType: SearchType;
    }>;
    searchCitations(query: SearchQuery): Promise<{
        query: string;
        results: {
            id: string;
            title: string;
            snippet: string;
            source: string;
            relevanceScore: number;
            specialty: string | undefined;
            citationCount: number;
        }[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
        searchType: SearchType;
    }>;
}
//# sourceMappingURL=search.service.d.ts.map