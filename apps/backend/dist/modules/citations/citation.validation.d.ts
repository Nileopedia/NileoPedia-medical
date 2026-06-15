import { z } from 'zod';
export declare const createCitationSchema: z.ZodObject<{
    aiResponseId: z.ZodOptional<z.ZodString>;
    title: z.ZodOptional<z.ZodString>;
    source: z.ZodOptional<z.ZodString>;
    authors: z.ZodOptional<z.ZodString>;
    publicationYear: z.ZodOptional<z.ZodNumber>;
    doi: z.ZodOptional<z.ZodString>;
    url: z.ZodOptional<z.ZodString>;
    documentType: z.ZodOptional<z.ZodString>;
    specialty: z.ZodOptional<z.ZodString>;
    chunkId: z.ZodOptional<z.ZodString>;
    pageNumber: z.ZodOptional<z.ZodNumber>;
    sectionTitle: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    aiResponseId?: string | undefined;
    title?: string | undefined;
    source?: string | undefined;
    authors?: string | undefined;
    publicationYear?: number | undefined;
    doi?: string | undefined;
    url?: string | undefined;
    documentType?: string | undefined;
    specialty?: string | undefined;
    chunkId?: string | undefined;
    pageNumber?: number | undefined;
    sectionTitle?: string | undefined;
}, {
    aiResponseId?: string | undefined;
    title?: string | undefined;
    source?: string | undefined;
    authors?: string | undefined;
    publicationYear?: number | undefined;
    doi?: string | undefined;
    url?: string | undefined;
    documentType?: string | undefined;
    specialty?: string | undefined;
    chunkId?: string | undefined;
    pageNumber?: number | undefined;
    sectionTitle?: string | undefined;
}>;
export declare const updateCitationSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    source: z.ZodOptional<z.ZodString>;
    authors: z.ZodOptional<z.ZodString>;
    publicationYear: z.ZodOptional<z.ZodNumber>;
    doi: z.ZodOptional<z.ZodString>;
    url: z.ZodOptional<z.ZodString>;
    documentType: z.ZodOptional<z.ZodString>;
    specialty: z.ZodOptional<z.ZodString>;
    pageNumber: z.ZodOptional<z.ZodNumber>;
    sectionTitle: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    title?: string | undefined;
    source?: string | undefined;
    authors?: string | undefined;
    publicationYear?: number | undefined;
    doi?: string | undefined;
    url?: string | undefined;
    documentType?: string | undefined;
    specialty?: string | undefined;
    pageNumber?: number | undefined;
    sectionTitle?: string | undefined;
}, {
    title?: string | undefined;
    source?: string | undefined;
    authors?: string | undefined;
    publicationYear?: number | undefined;
    doi?: string | undefined;
    url?: string | undefined;
    documentType?: string | undefined;
    specialty?: string | undefined;
    pageNumber?: number | undefined;
    sectionTitle?: string | undefined;
}>;
export declare const searchCitationsQuerySchema: z.ZodObject<{
    page: any;
    limit: any;
    keyword: z.ZodOptional<z.ZodString>;
    specialty: z.ZodOptional<z.ZodString>;
    publicationYear: z.ZodOptional<z.ZodNumber>;
    documentType: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    page?: any;
    limit?: any;
    keyword?: string | undefined;
    specialty?: string | undefined;
    publicationYear?: number | undefined;
    documentType?: string | undefined;
}, {
    page?: any;
    limit?: any;
    keyword?: string | undefined;
    specialty?: string | undefined;
    publicationYear?: number | undefined;
    documentType?: string | undefined;
}>;
//# sourceMappingURL=citation.validation.d.ts.map