import { z } from 'zod';
export declare const createDocumentSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    specialty: z.ZodOptional<z.ZodString>;
    documentType: z.ZodOptional<z.ZodString>;
    source: z.ZodOptional<z.ZodString>;
    publicationYear: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    title: string;
    description?: string | undefined;
    specialty?: string | undefined;
    documentType?: string | undefined;
    source?: string | undefined;
    publicationYear?: number | undefined;
}, {
    title: string;
    description?: string | undefined;
    specialty?: string | undefined;
    documentType?: string | undefined;
    source?: string | undefined;
    publicationYear?: number | undefined;
}>;
export declare const updateDocumentSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    specialty: z.ZodOptional<z.ZodString>;
    documentType: z.ZodOptional<z.ZodString>;
    source: z.ZodOptional<z.ZodString>;
    publicationYear: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    title?: string | undefined;
    description?: string | undefined;
    specialty?: string | undefined;
    documentType?: string | undefined;
    source?: string | undefined;
    publicationYear?: number | undefined;
}, {
    title?: string | undefined;
    description?: string | undefined;
    specialty?: string | undefined;
    documentType?: string | undefined;
    source?: string | undefined;
    publicationYear?: number | undefined;
}>;
export declare const getDocumentsQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    search: z.ZodOptional<z.ZodString>;
    ingestionStatus: z.ZodOptional<z.ZodNativeEnum<{
        PENDING: "PENDING";
        PROCESSING: "PROCESSING";
        COMPLETED: "COMPLETED";
        FAILED: "FAILED";
    }>>;
    documentType: z.ZodOptional<z.ZodString>;
    publicationYear: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    search?: string | undefined;
    ingestionStatus?: "PENDING" | "FAILED" | "PROCESSING" | "COMPLETED" | undefined;
    documentType?: string | undefined;
    publicationYear?: number | undefined;
}, {
    page?: number | undefined;
    limit?: number | undefined;
    search?: string | undefined;
    ingestionStatus?: "PENDING" | "FAILED" | "PROCESSING" | "COMPLETED" | undefined;
    documentType?: string | undefined;
    publicationYear?: number | undefined;
}>;
export declare const allowedMimeTypes: string[];
export declare const maxFileSize: number;
//# sourceMappingURL=document.validation.d.ts.map