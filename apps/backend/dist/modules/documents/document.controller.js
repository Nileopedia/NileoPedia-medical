"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentController = void 0;
const document_service_1 = require("./document.service");
const logger_1 = require("../../config/logger");
const document_validation_1 = require("./document.validation");
const document_validation_2 = require("./document.validation");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const client_1 = require("@prisma/client");
class DocumentController {
    constructor() {
        this.documentService = new document_service_1.DocumentService();
    }
    async getAllDocuments(req, res, next) {
        try {
            const ingestionStatusParam = req.query.ingestionStatus;
            const validStatuses = Object.values(client_1.IngestionStatus);
            const ingestionStatus = ingestionStatusParam && validStatuses.includes(ingestionStatusParam)
                ? ingestionStatusParam
                : undefined;
            const query = {
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 20,
                search: req.query.search,
                ingestionStatus,
                documentType: req.query.documentType,
                publicationYear: req.query.publicationYear ? parseInt(req.query.publicationYear) : undefined,
            };
            const result = await this.documentService.getAllDocuments(query);
            res.status(200).json({
                success: true,
                data: {
                    documents: result.documents,
                    pagination: {
                        total: result.total,
                        page: result.page,
                        limit: result.limit,
                        totalPages: result.totalPages,
                    },
                },
            });
        }
        catch (error) {
            logger_1.logger.error('Error in getAllDocuments controller:', error);
            next(error);
        }
    }
    async getDocumentById(req, res, next) {
        try {
            const { id } = req.params;
            const document = await this.documentService.getDocumentById(id);
            if (!document) {
                return res.status(404).json({
                    success: false,
                    message: 'Document not found',
                });
            }
            res.status(200).json({
                success: true,
                data: document,
            });
        }
        catch (error) {
            logger_1.logger.error('Error in getDocumentById controller:', error);
            next(error);
        }
    }
    async uploadDocument(req, res, next) {
        try {
            const file = req.file;
            const body = req.body;
            if (!file) {
                return res.status(400).json({
                    success: false,
                    message: 'No file uploaded',
                });
            }
            if (!document_validation_2.allowedMimeTypes.includes(file.mimetype)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid file type. Allowed types: ${document_validation_2.allowedMimeTypes.join(', ')}`,
                });
            }
            if (file.size > document_validation_2.maxFileSize) {
                return res.status(400).json({
                    success: false,
                    message: `File size exceeds maximum of ${document_validation_2.maxFileSize / 1024 / 1024}MB`,
                });
            }
            const fileExt = path_1.default.extname(file.originalname);
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}${fileExt}`;
            const uploadDir = process.env.UPLOAD_DIR || './uploads';
            const fileUrl = `/uploads/${fileName}`;
            const fullPath = path_1.default.join(process.cwd(), uploadDir, fileName);
            if (!fs_1.default.existsSync(path_1.default.join(process.cwd(), uploadDir))) {
                fs_1.default.mkdirSync(path_1.default.join(process.cwd(), uploadDir), { recursive: true });
            }
            fs_1.default.writeFileSync(fullPath, file.buffer);
            // FR-21: Create document pending verification
            const document = await this.documentService.createDocument({
                title: body.title || file.originalname.replace(/\.[^/.]+$/, ''),
                description: body.description,
                fileName,
                fileUrl,
                fileType: file.mimetype,
                fileSize: file.size,
                specialty: body.specialty,
                documentType: body.documentType,
                source: body.source,
                publicationYear: body.publicationYear ? parseInt(body.publicationYear) : undefined,
                uploadedById: req.user.id,
            });
            // DO NOT queue for ingestion yet - requires admin approval (FR-21)
            res.status(201).json({
                success: true,
                message: 'Document uploaded successfully. Awaiting admin approval for indexing.',
                data: document,
            });
        }
        catch (error) {
            logger_1.logger.error('Error in uploadDocument controller:', error);
            next(error);
        }
    }
    async updateDocument(req, res, next) {
        try {
            const { id } = req.params;
            const validatedData = document_validation_1.updateDocumentSchema.parse(req.body);
            const document = await this.documentService.updateDocument(id, validatedData);
            res.status(200).json({
                success: true,
                message: 'Document updated successfully',
                data: document,
            });
        }
        catch (error) {
            logger_1.logger.error('Error in updateDocument controller:', error);
            next(error);
        }
    }
    async deleteDocument(req, res, next) {
        try {
            const { id } = req.params;
            const document = await this.documentService.getDocumentById(id);
            if (!document) {
                return res.status(404).json({
                    success: false,
                    message: 'Document not found',
                });
            }
            if (document.fileUrl) {
                const filePath = path_1.default.join(process.cwd(), document.fileUrl);
                if (fs_1.default.existsSync(filePath)) {
                    fs_1.default.unlinkSync(filePath);
                }
            }
            await this.documentService.deleteDocument(id);
            res.status(200).json({
                success: true,
                message: 'Document deleted successfully',
            });
        }
        catch (error) {
            logger_1.logger.error('Error in deleteDocument controller:', error);
            next(error);
        }
    }
    async verifyDocument(req, res, next) {
        try {
            const { id } = req.params;
            const document = await this.documentService.verifyDocument(id);
            res.status(200).json({
                success: true,
                message: 'Document re-ingestion started',
                data: document,
            });
        }
        catch (error) {
            logger_1.logger.error('Error in verifyDocument controller:', error);
            next(error);
        }
    }
    async getIngestionStatus(req, res, next) {
        try {
            const { id } = req.params;
            const status = await this.documentService.getIngestionStatus(id);
            res.status(200).json({
                success: true,
                data: status,
            });
        }
        catch (error) {
            logger_1.logger.error('Error in getIngestionStatus controller:', error);
            next(error);
        }
    }
}
exports.DocumentController = DocumentController;
//# sourceMappingURL=document.controller.js.map