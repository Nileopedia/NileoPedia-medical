"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.keywordSearchSchema = exports.semanticSearchSchema = exports.searchQuerySchema = void 0;
const zod_1 = require("zod");
const searchTypes = ['semantic', 'keyword', 'hybrid'];
exports.searchQuerySchema = zod_1.z.object({
    q: zod_1.z.string().min(1, 'Search query is required').max(500, 'Search query too long'),
    type: zod_1.z.enum(searchTypes).default('hybrid'),
    specialty: zod_1.z.string().optional(),
    limit: zod_1.z.coerce.number().min(1, 'Limit must be at least 1').max(50, 'Limit cannot exceed 50').default(20),
    page: zod_1.z.coerce.number().min(1, 'Page must be at least 1').default(1),
    publicationYear: zod_1.z.coerce.number().int().optional(),
    documentType: zod_1.z.string().optional(),
});
exports.semanticSearchSchema = zod_1.z.object({
    q: zod_1.z.string().min(1, 'Search query is required').max(500, 'Search query too long'),
    topK: zod_1.z.coerce.number().min(1).max(50).default(10),
    specialty: zod_1.z.string().optional(),
});
exports.keywordSearchSchema = zod_1.z.object({
    q: zod_1.z.string().min(1, 'Search query is required').max(500, 'Search query too long'),
    limit: zod_1.z.coerce.number().min(1).max(50).default(20),
    specialty: zod_1.z.string().optional(),
});
//# sourceMappingURL=search.validation.js.map