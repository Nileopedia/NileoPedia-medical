import { Request, Response, NextFunction } from 'express';
import { DocumentService } from './document.service';
import { logger } from '../../config/logger';
import { updateDocumentSchema, getDocumentsQuerySchema } from './document.validation';
import { allowedMimeTypes, maxFileSize } from './document.validation';
import path from 'path';
import fs from 'fs';
import { documentQueue } from '../../jobs/queues';
import { IngestionStatus } from '@prisma/client';

export class DocumentController {
  private documentService: DocumentService;

  constructor() {
    this.documentService = new DocumentService();
  }

  async getAllDocuments(req: Request, res: Response, next: NextFunction) {
    try {
      const ingestionStatusParam = req.query.ingestionStatus as string;
      const validStatuses = Object.values(IngestionStatus);
      const ingestionStatus = ingestionStatusParam && validStatuses.includes(ingestionStatusParam as IngestionStatus)
        ? (ingestionStatusParam as IngestionStatus)
        : undefined;

      const query = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        search: req.query.search as string,
        ingestionStatus,
        documentType: req.query.documentType as string,
        publicationYear: req.query.publicationYear ? parseInt(req.query.publicationYear as string) : undefined,
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
    } catch (error) {
      logger.error('Error in getAllDocuments controller:', error);
      next(error);
    }
  }

  async getDocumentById(req: Request, res: Response, next: NextFunction) {
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
    } catch (error) {
      logger.error('Error in getDocumentById controller:', error);
      next(error);
    }
  }

  async uploadDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const file = req.file as Express.Multer.File | undefined;
      const body = req.body;

      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded',
        });
      }

      if (!allowedMimeTypes.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: `Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`,
        });
      }

      if (file.size > maxFileSize) {
        return res.status(400).json({
          success: false,
          message: `File size exceeds maximum of ${maxFileSize / 1024 / 1024}MB`,
        });
      }

      const fileExt = path.extname(file.originalname);
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}${fileExt}`;
      const uploadDir = process.env.UPLOAD_DIR || './uploads';
      const fileUrl = `/uploads/${fileName}`;
      const fullPath = path.join(process.cwd(), uploadDir, fileName);

      if (!fs.existsSync(path.join(process.cwd(), uploadDir))) {
        fs.mkdirSync(path.join(process.cwd(), uploadDir), { recursive: true });
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      fs.writeFileSync(fullPath, file.buffer as any);

      // Create document record
      const document = await this.documentService.createDocument({
        title: body.title,
        description: body.description,
        fileName,
        fileUrl,
        fileType: file.mimetype,
        fileSize: file.size,
        specialty: body.specialty,
        documentType: body.documentType,
        source: body.source,
        publicationYear: body.publicationYear ? parseInt(body.publicationYear) : undefined,
        uploadedById: req.user!.id,
      });

      // Queue document ingestion job
      await documentQueue.add('ingest', {
        documentId: document.id,
        fileUrl: document.fileUrl,
        fileType: document.fileType,
        fileName: document.fileName,
        title: document.title,
        specialty: document.specialty,
        documentType: document.documentType,
        uploadedById: req.user!.id,
        source: document.source,
        publicationYear: document.publicationYear,
      }, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
      });

      res.status(201).json({
        success: true,
        message: 'Document uploaded successfully. Processing started.',
        data: document,
      });
    } catch (error) {
      logger.error('Error in uploadDocument controller:', error);
      next(error);
    }
  }

  async updateDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const validatedData = updateDocumentSchema.parse(req.body);

      const document = await this.documentService.updateDocument(id, validatedData);

      res.status(200).json({
        success: true,
        message: 'Document updated successfully',
        data: document,
      });
    } catch (error) {
      logger.error('Error in updateDocument controller:', error);
      next(error);
    }
  }

  async deleteDocument(req: Request, res: Response, next: NextFunction) {
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
        const filePath = path.join(process.cwd(), document.fileUrl);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      await this.documentService.deleteDocument(id);

      res.status(200).json({
        success: true,
        message: 'Document deleted successfully',
      });
    } catch (error) {
      logger.error('Error in deleteDocument controller:', error);
      next(error);
    }
  }

  async verifyDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const document = await this.documentService.verifyDocument(id);

      res.status(200).json({
        success: true,
        message: 'Document verified successfully',
        data: document,
      });
    } catch (error) {
      logger.error('Error in verifyDocument controller:', error);
      next(error);
    }
  }

  async getIngestionStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const status = await this.documentService.getIngestionStatus(id);

      res.status(200).json({
        success: true,
        data: status,
      });
    } catch (error) {
      logger.error('Error in getIngestionStatus controller:', error);
      next(error);
    }
  }
}