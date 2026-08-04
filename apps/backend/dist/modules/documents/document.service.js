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
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../../config/prisma"));
const logger_1 = require("../../config/logger");
const metadata_service_1 = require("./metadata.service");
class DocumentService {
    constructor() {
        this.metadataService = new metadata_service_1.DocumentMetadataService();
    }
    async getAllDocuments(query) {
        const { page, limit, search, ingestionStatus, documentType, publicationYear, } = query;
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
            documents: documents.map((doc) => ({
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
            return;
        }
        // Delete Pinecone vectors (non-blocking)
        try {
            const { PineconeService } = await Promise.resolve().then(() => __importStar(require('../rag/services/pinecone.service')));
            const pineconeService = new PineconeService();
            await pineconeService.deleteByDocumentId(id);
        }
        catch (error) {
            logger_1.logger.warn('Proceeding with DB deletion despite Pinecone cleanup failure', { documentId: id, error });
        }
        // Delete child records to satisfy FK constraints
        await prisma_1.default.embeddingMetadata.deleteMany({
            where: { documentId: id },
        });
        await prisma_1.default.documentMetadata.deleteMany({
            where: { documentId: id },
        });
        // Document may have already been removed (cascade from schema or race condition)
        try {
            await prisma_1.default.medicalDocument.delete({
                where: { id },
            });
        }
        catch (error) {
            if (error.code === 'P2025') {
                logger_1.logger.warn('Document already deleted', { documentId: id });
            }
            else {
                throw error;
            }
        }
    }
    async deleteAllDocuments() {
        const documents = await prisma_1.default.medicalDocument.findMany({
            select: { id: true, fileUrl: true },
        });
        for (const document of documents) {
            await this.deleteDocument(document.id);
        }
        return { deletedCount: documents.length };
    }
    async verifyDocument(id) {
        const document = await prisma_1.default.medicalDocument.findUnique({ where: { id } });
        if (!document) {
            throw new Error('Document not found');
        }
        if (document.ingestionStatus === client_1.IngestionStatus.PROCESSING) {
            throw new Error('Document is currently processing');
        }
        // Clear old embeddings and chunks for re-ingestion
        await prisma_1.default.embeddingMetadata.deleteMany({
            where: { documentId: id },
        });
        // Delete old Pinecone vectors (non-blocking — proceed with re-ingestion even if this fails)
        try {
            const { PineconeService } = await Promise.resolve().then(() => __importStar(require('../rag/services/pinecone.service')));
            const pineconeService = new PineconeService();
            await pineconeService.deleteByDocumentId(id);
        }
        catch (error) {
            logger_1.logger.warn('Proceeding with re-ingestion using new vectors', { documentId: id, error });
        }
        // Reset document state
        await prisma_1.default.medicalDocument.update({
            where: { id },
            data: {
                isVerified: true,
                ingestionStatus: client_1.IngestionStatus.PROCESSING,
            },
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