import { z } from 'zod';
export declare const searchQuerySchema: z.ZodObject<{
    q: z.ZodString;
    type: z.ZodDefault<z.ZodEnum<["semantic", "keyword", "hybrid"]>>;
    specialty: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
    page: z.ZodDefault<z.ZodNumber>;
    publicationYear: z.ZodOptional<z.ZodNumber>;
    documentType: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "keyword" | "hybrid" | "semantic";
    q: string;
    page: number;
    limit: number;
    specialty?: string | undefined;
    publicationYear?: number | undefined;
    documentType?: string | undefined;
}, {
    q: string;
    type?: "keyword" | "hybrid" | "semantic" | undefined;
    specialty?: string | undefined;
    limit?: number | undefined;
    page?: number | undefined;
    publicationYear?: number | undefined;
    documentType?: string | undefined;
}>;
export declare const semanticSearchSchema: z.ZodObject<{
    q: z.ZodString;
    topK: z.ZodDefault<z.ZodNumber>;
    specialty: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    topK: number;
    q: string;
    specialty?: string | undefined;
}, {
    q: string;
    topK?: number | undefined;
    specialty?: string | undefined;
}>;
export declare const keywordSearchSchema: z.ZodObject<{
    q: z.ZodString;
    limit: z.ZodDefault<z.ZodNumber>;
    specialty: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    q: string;
    limit: number;
    specialty?: string | undefined;
}, {
    q: string;
    limit?: number | undefined;
    specialty?: string | undefined;
}>;
//# sourceMappingURL=search.validation.d.ts.map