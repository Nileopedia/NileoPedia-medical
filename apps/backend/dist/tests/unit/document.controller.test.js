"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const document_controller_1 = require("../../modules/documents/document.controller");
const document_service_1 = require("../../modules/documents/document.service");
const document_validation_1 = require("../../modules/documents/document.validation");
jest.mock('../../modules/documents/document.service');
jest.mock('../../config/logger', () => ({
    logger: {
        error: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
    },
}));
jest.mock('fs');
jest.mock('path');
const mockFs = fs_1.default;
const mockPath = path_1.default;
describe('DocumentController', () => {
    let controller;
    let mockDocumentService;
    let mockRequest;
    let mockResponse;
    let mockNext;
    const createMockResponse = () => ({
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
    });
    beforeEach(() => {
        jest.clearAllMocks();
        mockDocumentService = {
            getAllDocuments: jest.fn(),
            getDocumentById: jest.fn(),
            createDocument: jest.fn(),
            updateDocument: jest.fn(),
            deleteDocument: jest.fn(),
            verifyDocument: jest.fn(),
            getIngestionStatus: jest.fn(),
        };
        document_service_1.DocumentService.mockImplementation(() => mockDocumentService);
        controller = new document_controller_1.DocumentController();
        mockRequest = {
            query: {},
            params: {},
            body: {},
        };
        mockResponse = createMockResponse();
        mockNext = jest.fn();
        mockFs.existsSync.mockReturnValue(true);
        mockFs.mkdirSync.mockReturnValue(undefined);
        mockFs.writeFileSync.mockReturnValue(undefined);
        mockFs.unlinkSync.mockReturnValue(undefined);
        mockPath.extname.mockReturnValue('.pdf');
        mockPath.join.mockImplementation((...args) => args.join('/'));
    });
    describe('getAllDocuments', () => {
        it('should return documents with pagination', async () => {
            const mockDocuments = [
                { id: '1', title: 'Doc 1', createdAt: new Date() },
                { id: '2', title: 'Doc 2', createdAt: new Date() },
            ];
            mockDocumentService.getAllDocuments.mockResolvedValue({
                documents: mockDocuments,
                total: 2,
                page: 1,
                limit: 20,
                totalPages: 1,
            });
            mockRequest.query = {
                page: '1',
                limit: '20',
            };
            await controller.getAllDocuments(mockRequest, mockResponse, mockNext);
            expect(mockDocumentService.getAllDocuments).toHaveBeenCalledWith({
                page: 1,
                limit: 20,
                search: undefined,
                ingestionStatus: undefined,
                documentType: undefined,
                publicationYear: undefined,
            });
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                data: {
                    documents: mockDocuments,
                    pagination: {
                        total: 2,
                        page: 1,
                        limit: 20,
                        totalPages: 1,
                    },
                },
            });
        });
        it('should pass ingestionStatus query parameter when valid', async () => {
            mockDocumentService.getAllDocuments.mockResolvedValue({
                documents: [],
                total: 0,
                page: 1,
                limit: 20,
                totalPages: 0,
            });
            mockRequest.query = {
                ingestionStatus: client_1.IngestionStatus.PROCESSING,
                page: '2',
                limit: '10',
                search: 'test',
                documentType: 'research',
            };
            await controller.getAllDocuments(mockRequest, mockResponse, mockNext);
            expect(mockDocumentService.getAllDocuments).toHaveBeenCalledWith({
                page: 2,
                limit: 10,
                search: 'test',
                ingestionStatus: client_1.IngestionStatus.PROCESSING,
                documentType: 'research',
                publicationYear: undefined,
            });
        });
        it('should ignore invalid ingestionStatus query parameter', async () => {
            mockDocumentService.getAllDocuments.mockResolvedValue({
                documents: [],
                total: 0,
                page: 1,
                limit: 20,
                totalPages: 0,
            });
            mockRequest.query = {
                ingestionStatus: 'INVALID_STATUS',
            };
            await controller.getAllDocuments(mockRequest, mockResponse, mockNext);
            expect(mockDocumentService.getAllDocuments).toHaveBeenCalledWith(expect.objectContaining({
                ingestionStatus: undefined,
            }));
        });
        it('should handle service error and call next', async () => {
            const error = new Error('Database error');
            mockDocumentService.getAllDocuments.mockRejectedValue(error);
            await controller.getAllDocuments(mockRequest, mockResponse, mockNext);
            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });
    describe('getDocumentById', () => {
        it('should return document when found', async () => {
            const mockDocument = { id: 'doc-1', title: 'Test Document' };
            mockDocumentService.getDocumentById.mockResolvedValue(mockDocument);
            mockRequest.params = { id: 'doc-1' };
            await controller.getDocumentById(mockRequest, mockResponse, mockNext);
            expect(mockDocumentService.getDocumentById).toHaveBeenCalledWith('doc-1');
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                data: mockDocument,
            });
        });
        it('should return 404 when document not found', async () => {
            mockDocumentService.getDocumentById.mockResolvedValue(null);
            mockRequest.params = { id: 'nonexistent' };
            await controller.getDocumentById(mockRequest, mockResponse, mockNext);
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                message: 'Document not found',
            });
        });
        it('should handle service error and call next', async () => {
            const error = new Error('Database error');
            mockDocumentService.getDocumentById.mockRejectedValue(error);
            mockRequest.params = { id: 'doc-1' };
            await controller.getDocumentById(mockRequest, mockResponse, mockNext);
            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });
    describe('uploadDocument', () => {
        const mockFile = {
            originalname: 'test.pdf',
            mimetype: 'application/pdf',
            size: 1024,
            buffer: Buffer.from('test'),
        };
        it('should return 400 when no file uploaded', async () => {
            mockRequest.file = undefined;
            mockRequest.body = {};
            mockRequest.user = { id: 'user-1' };
            await controller.uploadDocument(mockRequest, mockResponse, mockNext);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                message: 'No file uploaded',
            });
        });
        it('should return 400 when invalid mime type', async () => {
            mockRequest.file = { ...mockFile, mimetype: 'application/exe' };
            mockRequest.body = {};
            mockRequest.user = { id: 'user-1' };
            await controller.uploadDocument(mockRequest, mockResponse, mockNext);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                message: `Invalid file type. Allowed types: ${document_validation_1.allowedMimeTypes.join(', ')}`,
            });
        });
        it('should return 400 when file size exceeds limit', async () => {
            mockRequest.file = { ...mockFile, size: document_validation_1.maxFileSize + 1 };
            mockRequest.body = {};
            mockRequest.user = { id: 'user-1' };
            await controller.uploadDocument(mockRequest, mockResponse, mockNext);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                message: `File size exceeds maximum of ${document_validation_1.maxFileSize / 1024 / 1024}MB`,
            });
        });
        it('should successfully upload document with valid file', async () => {
            const mockDocument = { id: 'doc-1', title: 'Test Document' };
            mockDocumentService.createDocument.mockResolvedValue(mockDocument);
            mockRequest.file = mockFile;
            mockRequest.body = {
                title: 'Custom Title',
                description: 'Test description',
                specialty: 'cardiology',
                documentType: 'research',
                source: 'journal',
            };
            mockRequest.user = { id: 'user-1' };
            await controller.uploadDocument(mockRequest, mockResponse, mockNext);
            expect(mockDocumentService.createDocument).toHaveBeenCalledWith(expect.objectContaining({
                title: 'Custom Title',
                description: 'Test description',
                fileType: 'application/pdf',
                fileSize: 1024,
                uploadedById: 'user-1',
            }));
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                message: 'Document uploaded successfully. Awaiting admin approval for indexing.',
                data: mockDocument,
            });
        });
        it('should use filename as title when title not provided', async () => {
            const mockDocument = { id: 'doc-1', title: 'test' };
            mockDocumentService.createDocument.mockResolvedValue(mockDocument);
            mockRequest.file = mockFile;
            mockRequest.body = {};
            mockRequest.user = { id: 'user-1' };
            await controller.uploadDocument(mockRequest, mockResponse, mockNext);
            expect(mockDocumentService.createDocument).toHaveBeenCalledWith(expect.objectContaining({
                title: 'test',
            }));
        });
        it('should handle service error and call next', async () => {
            const error = new Error('Upload error');
            mockDocumentService.createDocument.mockRejectedValue(error);
            mockRequest.file = mockFile;
            mockRequest.body = {};
            mockRequest.user = { id: 'user-1' };
            await controller.uploadDocument(mockRequest, mockResponse, mockNext);
            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });
    describe('updateDocument', () => {
        it('should successfully update document', async () => {
            const mockDocument = { id: 'doc-1', title: 'Updated Document' };
            mockDocumentService.updateDocument.mockResolvedValue(mockDocument);
            mockRequest.params = { id: 'doc-1' };
            mockRequest.body = {
                title: 'Updated Document',
                description: 'Updated description',
            };
            await controller.updateDocument(mockRequest, mockResponse, mockNext);
            expect(mockDocumentService.updateDocument).toHaveBeenCalledWith('doc-1', expect.objectContaining({
                title: 'Updated Document',
                description: 'Updated description',
            }));
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                message: 'Document updated successfully',
                data: mockDocument,
            });
        });
        it('should handle service error and call next', async () => {
            const error = new Error('Update error');
            mockDocumentService.updateDocument.mockRejectedValue(error);
            mockRequest.params = { id: 'doc-1' };
            mockRequest.body = { title: 'Updated' };
            await controller.updateDocument(mockRequest, mockResponse, mockNext);
            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });
    describe('deleteDocument', () => {
        it('should return 404 when document not found', async () => {
            mockDocumentService.getDocumentById.mockResolvedValue(null);
            mockRequest.params = { id: 'nonexistent' };
            await controller.deleteDocument(mockRequest, mockResponse, mockNext);
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                message: 'Document not found',
            });
        });
        it('should successfully delete document', async () => {
            const mockDocument = {
                id: 'doc-1',
                fileUrl: '/uploads/test.pdf',
            };
            mockDocumentService.getDocumentById.mockResolvedValue(mockDocument);
            mockDocumentService.deleteDocument.mockResolvedValue(mockDocument);
            mockFs.existsSync.mockReturnValue(true);
            mockRequest.params = { id: 'doc-1' };
            await controller.deleteDocument(mockRequest, mockResponse, mockNext);
            expect(mockDocumentService.deleteDocument).toHaveBeenCalledWith('doc-1');
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                message: 'Document deleted successfully',
            });
        });
        it('should delete document file when exists', async () => {
            const mockDocument = {
                id: 'doc-1',
                fileUrl: '/uploads/test-file.pdf',
            };
            mockDocumentService.getDocumentById.mockResolvedValue(mockDocument);
            mockDocumentService.deleteDocument.mockResolvedValue(mockDocument);
            mockFs.existsSync.mockReturnValue(true);
            mockRequest.params = { id: 'doc-1' };
            await controller.deleteDocument(mockRequest, mockResponse, mockNext);
            expect(mockFs.unlinkSync).toHaveBeenCalled();
        });
        it('should handle missing file gracefully', async () => {
            const mockDocument = {
                id: 'doc-1',
                fileUrl: '/uploads/missing.pdf',
            };
            mockDocumentService.getDocumentById.mockResolvedValue(mockDocument);
            mockDocumentService.deleteDocument.mockResolvedValue(mockDocument);
            mockFs.existsSync.mockReturnValue(false);
            mockRequest.params = { id: 'doc-1' };
            await controller.deleteDocument(mockRequest, mockResponse, mockNext);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockFs.unlinkSync).not.toHaveBeenCalled();
        });
        it('should handle service error and call next', async () => {
            const error = new Error('Delete error');
            mockDocumentService.getDocumentById.mockRejectedValue(error);
            mockRequest.params = { id: 'doc-1' };
            await controller.deleteDocument(mockRequest, mockResponse, mockNext);
            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });
    describe('verifyDocument', () => {
        it('should successfully verify document', async () => {
            const mockDocument = { id: 'doc-1', title: 'Test Document' };
            mockDocumentService.verifyDocument.mockResolvedValue(mockDocument);
            mockRequest.params = { id: 'doc-1' };
            await controller.verifyDocument(mockRequest, mockResponse, mockNext);
            expect(mockDocumentService.verifyDocument).toHaveBeenCalledWith('doc-1');
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                message: 'Document re-ingestion started',
                data: mockDocument,
            });
        });
        it('should handle service error and call next', async () => {
            const error = new Error('Verify error');
            mockDocumentService.verifyDocument.mockRejectedValue(error);
            mockRequest.params = { id: 'doc-1' };
            await controller.verifyDocument(mockRequest, mockResponse, mockNext);
            expect(mockNext).toHaveBeenCalledWith(error);
        });
        it('should reject when document is currently processing', async () => {
            const error = new Error('Document is currently processing');
            mockDocumentService.verifyDocument.mockRejectedValue(error);
            mockRequest.params = { id: 'doc-1' };
            await controller.verifyDocument(mockRequest, mockResponse, mockNext);
            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });
    describe('getIngestionStatus', () => {
        it('should return ingestion status for document', async () => {
            const mockStatus = {
                documentId: 'doc-1',
                ingestionStatus: client_1.IngestionStatus.PROCESSING,
                chunksProcessed: 5,
                vectorsStored: 10,
            };
            mockDocumentService.getIngestionStatus.mockResolvedValue(mockStatus);
            mockRequest.params = { id: 'doc-1' };
            await controller.getIngestionStatus(mockRequest, mockResponse, mockNext);
            expect(mockDocumentService.getIngestionStatus).toHaveBeenCalledWith('doc-1');
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                data: mockStatus,
            });
        });
        it('should handle service error and call next', async () => {
            const error = new Error('Status error');
            mockDocumentService.getIngestionStatus.mockRejectedValue(error);
            mockRequest.params = { id: 'doc-1' };
            await controller.getIngestionStatus(mockRequest, mockResponse, mockNext);
            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });
});
//# sourceMappingURL=document.controller.test.js.map