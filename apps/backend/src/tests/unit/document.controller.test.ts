/* eslint-env jest */
/* eslint-disable import/no-unresolved */
import { Request, Response, NextFunction } from 'express';
import { IngestionStatus } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { DocumentController } from '../../modules/documents/document.controller';
import { DocumentService } from '../../modules/documents/document.service';
import { allowedMimeTypes, maxFileSize } from '../../modules/documents/document.validation';

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

const mockFs = fs as jest.Mocked<typeof fs>;
const mockPath = path as jest.Mocked<typeof path>;

describe('DocumentController', () => {
  let controller: DocumentController;
  let mockDocumentService: {
    getAllDocuments: jest.Mock;
    getDocumentById: jest.Mock;
    createDocument: jest.Mock;
    updateDocument: jest.Mock;
    deleteDocument: jest.Mock;
    verifyDocument: jest.Mock;
    getIngestionStatus: jest.Mock;
  };
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  const createMockResponse = (): Partial<Response> => ({
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

    (DocumentService as jest.Mock).mockImplementation(() => mockDocumentService);

    controller = new DocumentController();

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
    mockPath.join.mockImplementation((...args: any[]) => args.join('/'));
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

      await controller.getAllDocuments(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

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
        ingestionStatus: IngestionStatus.PROCESSING,
        page: '2',
        limit: '10',
        search: 'test',
        documentType: 'research',
      };

      await controller.getAllDocuments(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockDocumentService.getAllDocuments).toHaveBeenCalledWith({
        page: 2,
        limit: 10,
        search: 'test',
        ingestionStatus: IngestionStatus.PROCESSING,
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

      await controller.getAllDocuments(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockDocumentService.getAllDocuments).toHaveBeenCalledWith(
        expect.objectContaining({
          ingestionStatus: undefined,
        }),
      );
    });

    it('should handle service error and call next', async () => {
      const error = new Error('Database error');
      mockDocumentService.getAllDocuments.mockRejectedValue(error);

      await controller.getAllDocuments(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getDocumentById', () => {
    it('should return document when found', async () => {
      const mockDocument = { id: 'doc-1', title: 'Test Document' };
      mockDocumentService.getDocumentById.mockResolvedValue(mockDocument);

      mockRequest.params = { id: 'doc-1' };

      await controller.getDocumentById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

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

      await controller.getDocumentById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

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

      await controller.getDocumentById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('uploadDocument', () => {
    const mockFile = {
      originalname: 'test.pdf',
      mimetype: 'application/pdf',
      size: 1024,
      buffer: Buffer.from('test'),
    } as any;

    it('should return 400 when no file uploaded', async () => {
      mockRequest.file = undefined;
      mockRequest.body = {};
      mockRequest.user = { id: 'user-1' } as any;

      await controller.uploadDocument(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'No file uploaded',
      });
    });

    it('should return 400 when invalid mime type', async () => {
      mockRequest.file = { ...mockFile, mimetype: 'application/exe' };
      mockRequest.body = {};
      mockRequest.user = { id: 'user-1' } as any;

      await controller.uploadDocument(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: `Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`,
      });
    });

    it('should return 400 when file size exceeds limit', async () => {
      mockRequest.file = { ...mockFile, size: maxFileSize + 1 };
      mockRequest.body = {};
      mockRequest.user = { id: 'user-1' } as any;

      await controller.uploadDocument(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: `File size exceeds maximum of ${maxFileSize / 1024 / 1024}MB`,
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
      mockRequest.user = { id: 'user-1' } as any;

      await controller.uploadDocument(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockDocumentService.createDocument).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Custom Title',
          description: 'Test description',
          fileType: 'application/pdf',
          fileSize: 1024,
          uploadedById: 'user-1',
        }),
      );
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
      mockRequest.user = { id: 'user-1' } as any;

      await controller.uploadDocument(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockDocumentService.createDocument).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'test',
        }),
      );
    });

    it('should handle service error and call next', async () => {
      const error = new Error('Upload error');
      mockDocumentService.createDocument.mockRejectedValue(error);

      mockRequest.file = mockFile;
      mockRequest.body = {};
      mockRequest.user = { id: 'user-1' } as any;

      await controller.uploadDocument(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

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

      await controller.updateDocument(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockDocumentService.updateDocument).toHaveBeenCalledWith(
        'doc-1',
        expect.objectContaining({
          title: 'Updated Document',
          description: 'Updated description',
        }),
      );
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

      await controller.updateDocument(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('deleteDocument', () => {
    it('should return 404 when document not found', async () => {
      mockDocumentService.getDocumentById.mockResolvedValue(null);

      mockRequest.params = { id: 'nonexistent' };

      await controller.deleteDocument(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

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

      await controller.deleteDocument(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

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

      await controller.deleteDocument(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

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

      await controller.deleteDocument(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockFs.unlinkSync).not.toHaveBeenCalled();
    });

    it('should handle service error and call next', async () => {
      const error = new Error('Delete error');
      mockDocumentService.getDocumentById.mockRejectedValue(error);

      mockRequest.params = { id: 'doc-1' };

      await controller.deleteDocument(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('verifyDocument', () => {
    it('should successfully verify document', async () => {
      const mockDocument = { id: 'doc-1', title: 'Test Document' };
      mockDocumentService.verifyDocument.mockResolvedValue(mockDocument);

      mockRequest.params = { id: 'doc-1' };

      await controller.verifyDocument(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

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

      await controller.verifyDocument(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should reject when document is currently processing', async () => {
      const error = new Error('Document is currently processing');
      mockDocumentService.verifyDocument.mockRejectedValue(error);

      mockRequest.params = { id: 'doc-1' };

      await controller.verifyDocument(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getIngestionStatus', () => {
    it('should return ingestion status for document', async () => {
      const mockStatus = {
        documentId: 'doc-1',
        ingestionStatus: IngestionStatus.PROCESSING,
        chunksProcessed: 5,
        vectorsStored: 10,
      };
      mockDocumentService.getIngestionStatus.mockResolvedValue(mockStatus);

      mockRequest.params = { id: 'doc-1' };

      await controller.getIngestionStatus(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

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

      await controller.getIngestionStatus(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
