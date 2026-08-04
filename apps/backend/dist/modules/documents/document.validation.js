"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maxFileSize = exports.allowedMimeTypes = exports.getDocumentsQuerySchema = exports.updateDocumentSchema = exports.createDocumentSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createDocumentSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required'),
    description: zod_1.z.string().optional(),
    specialty: zod_1.z.string().optional(),
    documentType: zod_1.z.string().optional(),
    source: zod_1.z.string().optional(),
    publicationYear: zod_1.z.number().int().min(1900).max(new Date().getFullYear() + 10)
        .optional(),
});
exports.updateDocumentSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required').optional(),
    description: zod_1.z.string().optional(),
    specialty: zod_1.z.string().optional(),
    documentType: zod_1.z.string().optional(),
    source: zod_1.z.string().optional(),
    publicationYear: zod_1.z.number().int().min(1900).max(new Date().getFullYear() + 10)
        .optional(),
});
exports.getDocumentsQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().min(1, 'Page must be at least 1').default(1),
    limit: zod_1.z.coerce.number().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').default(20),
    search: zod_1.z.string().optional(),
    ingestionStatus: zod_1.z.nativeEnum(client_1.IngestionStatus).optional(),
    documentType: zod_1.z.string().optional(),
    publicationYear: zod_1.z.coerce.number().int().optional(),
});
exports.allowedMimeTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'text/html', 'application/xhtml+xml'];
exports.maxFileSize = 25 * 1024 * 1024; // 25MB
//# sourceMappingURL=document.validation.js.map