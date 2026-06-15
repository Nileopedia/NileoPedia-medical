import { SearchType, SearchResult, SearchQuery, SearchResultResponse } from './search.types';
export declare class SearchService {
    private retrievalService;
    constructor();
    globalSearch(query: SearchQuery): Promise<SearchResultResponse>;
    private getMockResults;
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