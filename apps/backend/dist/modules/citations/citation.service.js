"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CitationService = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
class CitationService {
    async getCitationsForResponse(aiResponseId) {
        return prisma_1.default.citation.findMany({
            where: { aiResponseId },
            orderBy: { citationIndex: 'asc' },
        });
    }
    async getCitationById(id) {
        return prisma_1.default.citation.findUnique({
            where: { id },
        });
    }
    async searchCitations(query) {
        const { page, limit, keyword, specialty, publicationYear, documentType, } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (keyword) {
            where.OR = [
                { title: { contains: keyword, mode: 'insensitive' } },
                { source: { contains: keyword, mode: 'insensitive' } },
            ];
        }
        if (specialty)
            where.specialty = specialty;
        if (publicationYear)
            where.publicationYear = publicationYear;
        if (documentType)
            where.documentType = documentType;
        const [citations, total] = await Promise.all([
            prisma_1.default.citation.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma_1.default.citation.count({ where }),
        ]);
        return {
            citations,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async createCitation(data) {
        const citationCount = await prisma_1.default.citation.count({
            where: { aiResponseId: data.aiResponseId },
        });
        return prisma_1.default.citation.create({
            data: {
                aiResponseId: data.aiResponseId,
                title: data.title,
                source: data.source,
                authors: data.authors,
                publicationYear: data.publicationYear,
                doi: data.doi,
                url: data.url,
                documentType: data.documentType,
                specialty: data.specialty,
                chunkId: data.chunkId,
                pageNumber: data.pageNumber,
                sectionTitle: data.sectionTitle,
                citationIndex: citationCount + 1,
            },
        });
    }
    async updateCitation(id, data) {
        const citation = await prisma_1.default.citation.findUnique({ where: { id } });
        if (!citation) {
            throw new Error('Citation not found');
        }
        return prisma_1.default.citation.update({
            where: { id },
            data,
        });
    }
    async deleteCitation(id) {
        const citation = await prisma_1.default.citation.findUnique({ where: { id } });
        if (!citation) {
            throw new Error('Citation not found');
        }
        return prisma_1.default.citation.delete({
            where: { id },
        });
    }
}
exports.CitationService = CitationService;
//# sourceMappingURL=citation.service.js.map