"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentService = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const client_1 = require("@prisma/client");
const metadata_service_1 = require("./metadata.service");
class DocumentService {
    constructor() {
        this.metadataService = new metadata_service_1.DocumentMetadataService();
    }
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
                    documentMetadata: true,
                },
            }),
            prisma_1.default.medicalDocument.count({ where }),
        ]);
        return {
            documents: documents.map(doc => ({
                ...doc,
                metadata: doc.documentMetadata || undefined,
            })),
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
                documentMetadata: true,
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
        await prisma_1.default.documentMetadata.deleteMany({
            where: { documentId: id },
        });
        await prisma_1.default.medicalDocument.delete({
            where: { id },
        });
    }
    async verifyDocument(id) {
        const document = await prisma_1.default.medicalDocument.findUnique({ where: { id } });
        if (!document) {
            throw new Error('Document not found');
        }
        if (document.ingestionStatus !== client_1.IngestionStatus.PENDING) {
            throw new Error('Document is not pending verification');
        }
        await prisma_1.default.medicalDocument.update({
            where: { id },
            data: { isVerified: true, ingestionStatus: client_1.IngestionStatus.PROCESSING },
        });
        const { documentQueue } = await Promise.resolve().then(() => __importStar(require('../../jobs/queues')));
        if (document.fileUrl) {
            await documentQueue.add('ingest', {
                documentId: id,
                fileUrl: document.fileUrl,
                fileType: document.fileType,
                fileName: document.fileName,
                title: document.title,
                specialty: document.specialty,
                documentType: document.documentType,
                uploadedById: document.uploadedById,
                source: document.source,
                publicationYear: document.publicationYear,
            });
        }
        return prisma_1.default.medicalDocument.findUnique({ where: { id } });
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
                documentMetadata: true,
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
            metadata: document.documentMetadata || undefined,
        };
    }
}
exports.DocumentService = DocumentService;
//# sourceMappingURL=document.service.js.map