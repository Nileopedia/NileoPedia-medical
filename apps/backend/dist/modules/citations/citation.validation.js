"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchCitationsQuerySchema = exports.updateCitationSchema = exports.createCitationSchema = void 0;
const zod_1 = require("zod");
exports.createCitationSchema = zod_1.z.object({
    aiResponseId: zod_1.z.string().uuid('Invalid AI response ID').optional(),
    title: zod_1.z.string().min(1, 'Title is required').optional(),
    source: zod_1.z.string().min(1, 'Source is required').optional(),
    authors: zod_1.z.string().optional(),
    publicationYear: zod_1.z.number().int().min(1900).max(new Date().getFullYear() + 10).optional(),
    doi: zod_1.z.string().optional(),
    url: zod_1.z.string().url('Invalid URL format').optional(),
    documentType: zod_1.z.string().optional(),
    specialty: zod_1.z.string().optional(),
    chunkId: zod_1.z.string().optional(),
    pageNumber: zod_1.z.number().int().positive().optional(),
    sectionTitle: zod_1.z.string().optional(),
});
exports.updateCitationSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required').optional(),
    source: zod_1.z.string().min(1, 'Source is required').optional(),
    authors: zod_1.z.string().optional(),
    publicationYear: zod_1.z.number().int().min(1900).max(new Date().getFullYear() + 10).optional(),
    doi: zod_1.z.string().optional(),
    url: zod_1.z.string().url('Invalid URL format').optional(),
    documentType: zod_1.z.string().optional(),
    specialty: zod_1.z.string().optional(),
    pageNumber: zod_1.z.number().int().positive().optional(),
    sectionTitle: zod_1.z.string().optional(),
});
exports.searchCitationsQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().min(1, 'Page must be at least 1').default(1),
    limit: zod_1.z.coerce.number().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').default(20),
    keyword: zod_1.z.string().optional(),
    specialty: zod_1.z.string().optional(),
    publicationYear: zod_1.z.coerce.number().int().optional(),
    documentType: zod_1.z.string().optional(),
});
//# sourceMappingURL=citation.validation.js.map