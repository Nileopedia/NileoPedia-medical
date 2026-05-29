import { Citation } from '@prisma/client';
export interface CreateCitationDto {
    aiResponseId: string;
    title: string;
    source: string;
    authors?: string;
    publicationYear?: number;
    doi?: string;
    url?: string;
    documentType?: string;
    specialty?: string;
    chunkId?: string;
    pageNumber?: number;
    sectionTitle?: string;
}
export interface UpdateCitationDto {
    title?: string;
    source?: string;
    authors?: string;
    publicationYear?: number;
    doi?: string;
    url?: string;
    documentType?: string;
    specialty?: string;
    pageNumber?: number;
    sectionTitle?: string;
}
export interface SearchCitationsQuery {
    page: number;
    limit: number;
    keyword?: string;
    specialty?: string;
    publicationYear?: number;
    documentType?: string;
}
export interface SearchCitationsResult {
    citations: Citation[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
//# sourceMappingURL=citation.types.d.ts.map