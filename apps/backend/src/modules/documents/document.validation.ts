import { z } from 'zod';
import { IngestionStatus } from '@prisma/client';

export const createDocumentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  specialty: z.string().optional(),
  documentType: z.string().optional(),
  source: z.string().optional(),
  publicationYear: z.number().int().min(1900).max(new Date().getFullYear() + 10)
    .optional(),
});

export const updateDocumentSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().optional(),
  specialty: z.string().optional(),
  documentType: z.string().optional(),
  source: z.string().optional(),
  publicationYear: z.number().int().min(1900).max(new Date().getFullYear() + 10)
    .optional(),
});

export const getDocumentsQuerySchema = z.object({
  page: z.coerce.number().min(1, 'Page must be at least 1').default(1),
  limit: z.coerce.number().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').default(20),
  search: z.string().optional(),
  ingestionStatus: z.nativeEnum(IngestionStatus).optional(),
  documentType: z.string().optional(),
  publicationYear: z.coerce.number().int().optional(),
});

export const allowedMimeTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'text/html', 'application/xhtml+xml'];
export const maxFileSize = 25 * 1024 * 1024; // 25MB
