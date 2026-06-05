"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentService = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const client_1 = require("@prisma/client");
class DocumentService {
    async getAllDocuments(query) {
        const { page, limit, search, ingestionStatus, documentType, publicationYear } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (ingestionStatus)
            where.ingestionStatus = ingestionStatus;
        if (documentType)
            where.documentType = documentType;
        if (publicationYear)
            where.publicationYear = publicationYear;
        const [documents, total] = await Promise.all([
            prisma_1.default.medicalDocument.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    embeddingMetadata: true,
                },
            }),
            prisma_1.default.medicalDocument.count({ where }),
        ]);
        return {
            documents,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async getDocumentById(id) {
        return prisma_1.default.medicalDocument.findUnique({
            where: { id },
            include: {
                embeddingMetadata: true,
            },
        });
    }
    async createDocument(data) {
        return prisma_1.default.medicalDocument.create({
            data: {
                title: data.title,
                description: data.description,
                fileName: data.fileName,
                fileUrl: data.fileUrl,
                fileType: data.fileType,
                fileSize: data.fileSize,
                specialty: data.specialty,
                documentType: data.documentType,
                source: data.source,
                publicationYear: data.publicationYear,
                uploadedById: data.uploadedById,
                ingestionStatus: client_1.IngestionStatus.PENDING,
            },
        });
    }
    async updateDocument(id, data) {
        const document = await prisma_1.default.medicalDocument.findUnique({ where: { id } });
        if (!document) {
            throw new Error('Document not found');
        }
        return prisma_1.default.medicalDocument.update({
            where: { id },
            data,
        });
    }
    async deleteDocument(id) {
        const document = await prisma_1.default.medicalDocument.findUnique({ where: { id } });
        if (!document) {
            throw new Error('Document not found');
        }
        return prisma_1.default.medicalDocument.delete({
            where: { id },
        });
    }
    async verifyDocument(id) {
        const document = await prisma_1.default.medicalDocument.findUnique({ where: { id } });
        if (!document) {
            throw new Error('Document not found');
        }
        return prisma_1.default.medicalDocument.update({
            where: { id },
            data: { isVerified: true },
        });
    }
    async updateIngestionStatus(id, status) {
        return prisma_1.default.medicalDocument.update({
            where: { id },
            data: { ingestionStatus: status },
        });
    }
    async getIngestionStatus(id) {
        const document = await prisma_1.default.medicalDocument.findUnique({
            where: { id },
            select: {
                id: true,
                ingestionStatus: true,
                embeddingMetadata: {
                    select: { id: true },
                },
            },
        });
        if (!document) {
            throw new Error('Document not found');
        }
        return {
            documentId: document.id,
            ingestionStatus: document.ingestionStatus,
            chunksProcessed: document.embeddingMetadata.length,
            vectorsStored: document.embeddingMetadata.length,
        };
    }
}
exports.DocumentService = DocumentService;
//# sourceMappingURL=document.service.js.map