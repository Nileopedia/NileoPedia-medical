export type SearchType = 'semantic' | 'keyword' | 'hybrid';

export interface SearchResult {
  id: string;
  title: string;
  snippet: string;
  source: string;
  relevanceScore: number;
  specialty?: string;
  citationCount?: number;
  documentType?: string;
}

export interface SearchQuery {
  q: string;
  type: SearchType;
  specialty?: string;
  limit: number;
  page: number;
  publicationYear?: number;
  documentType?: string;
}

export interface SearchResultResponse {
  query: string;
  results: SearchResult[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  searchType: SearchType;
}