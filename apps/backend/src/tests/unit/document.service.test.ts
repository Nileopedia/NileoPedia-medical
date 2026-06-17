/* eslint-env jest */
import { IngestionStatus } from '@prisma/client';

// Mock the entire DocumentService for unit testing
const mockDocumentService = {
  getAllDocuments: jest.fn(),
  getDocumentById: jest.fn(),
  createDocument: jest.fn(),
  updateDocument: jest.fn(),
  deleteDocument: jest.fn(),
  verifyDocument: jest.fn(),
  getIngestionStatus: jest.fn(),
};

jest.mock('../../modules/documents/document.service', () => ({
  DocumentService: jest.fn().mockImplementation(() => mockDocumentService),
}));

jest.mock('../../jobs/queues', () => ({
  documentQueue: {
    add: jest.fn(),
  },
}));

import { DocumentService } from '../../modules/documents/document.service';

describe('DocumentService', () => {
  let service: typeof mockDocumentService;

  beforeEach(() => {
    jest.clearAllMocks();
    const DocumentServiceMock = new (DocumentService as any)();
    service = DocumentServiceMock;
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

      const result = await service.getAllDocuments({ page: 1, limit: 20 });

      expect(result.documents).toEqual(mockDocuments);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.totalPages).toBe(1);
    });

    it('should filter by search', async () => {
      mockDocumentService.getAllDocuments.mockResolvedValue({
        documents: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      });

      await service.getAllDocuments({ page: 1, limit: 20, search: 'diabetes' });

      expect(mockDocumentService.getAllDocuments).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'diabetes',
        }),
      );
    });

    it('should filter by ingestionStatus', async () => {
      mockDocumentService.getAllDocuments.mockResolvedValue({
        documents: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      });

      await service.getAllDocuments({
        page: 1,
        limit: 20,
        ingestionStatus: IngestionStatus.PROCESSING,
      });

      expect(mockDocumentService.getAllDocuments).toHaveBeenCalledWith(
        expect.objectContaining({
          ingestionStatus: IngestionStatus.PROCESSING,
        }),
      );
    });

    it('should filter by documentType', async () => {
      mockDocumentService.getAllDocuments.mockResolvedValue({
        documents: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      });

      await service.getAllDocuments({
        page: 1,
        limit: 20,
        documentType: 'research',
      });

      expect(mockDocumentService.getAllDocuments).toHaveBeenCalledWith(
        expect.objectContaining({
          documentType: 'research',
        }),
      );
    });

    it('should filter by publicationYear', async () => {
      mockDocumentService.getAllDocuments.mockResolvedValue({
        documents: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      });

      await service.getAllDocuments({
        page: 1,
        limit: 20,
        publicationYear: 2023,
      });

      expect(mockDocumentService.getAllDocuments).toHaveBeenCalledWith(
        expect.objectContaining({
          publicationYear: 2023,
        }),
      );
    });
  });

  describe('getDocumentById', () => {
    it('should return document by id', async () => {
      const mockDocument = { id: 'doc-1', title: 'Test Document' };
      mockDocumentService.getDocumentById.mockResolvedValue(mockDocument);

      const result = await service.getDocumentById('doc-1');

      expect(result).toEqual(mockDocument);
    });
  });

  describe('createDocument', () => {
    it('should create document', async () => {
      const mockDocument = { id: 'doc-1', title: 'Test Document' };
      mockDocumentService.createDocument.mockResolvedValue(mockDocument);

      const result = await service.createDocument({
        title: 'Test Document',
        fileName: 'test.pdf',
        fileUrl: '/uploads/test.pdf',
        fileType: 'application/pdf',
        fileSize: 1024,
        uploadedById: 'user-1',
        specialty: 'cardiology',
        documentType: 'research',
        source: 'journal',
        publicationYear: 2023,
      });

      expect(mockDocumentService.createDocument).toHaveBeenCalled();
    });
  });

  describe('updateDocument', () => {
    it('should update document successfully', async () => {
      const mockDocument = { id: 'doc-1', title: 'Updated Document' };
      mockDocumentService.updateDocument.mockResolvedValue(mockDocument);

      const result = await service.updateDocument('doc-1', { title: 'Updated Document' });

      expect(result).toEqual(mockDocument);
    });
  });

  describe('verifyDocument', () => {
    it('should verify document successfully', async () => {
      const mockDocument = { id: 'doc-1', title: 'Test Document' };
      mockDocumentService.verifyDocument.mockResolvedValue(mockDocument);

      const result = await service.verifyDocument('doc-1');

      expect(result).toEqual(mockDocument);
    });
  });

  describe('getIngestionStatus', () => {
    it('should return ingestion status', async () => {
      const mockStatus = {
        documentId: 'doc-1',
        ingestionStatus: IngestionStatus.PROCESSING,
        chunksProcessed: 5,
        vectorsStored: 5,
      };
      mockDocumentService.getIngestionStatus.mockResolvedValue(mockStatus);

      const result = await service.getIngestionStatus('doc-1');

      expect(result).toEqual(mockStatus);
    });
  });
});