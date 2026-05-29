import { z } from 'zod';

export const createCitationSchema = z.object({
  aiResponseId: z.string().uuid('Invalid AI response ID'),
  title: z.string().min(1, 'Title is required'),
  source: z.string().min(1, 'Source is required'),
  authors: z.string().optional(),
  publicationYear: z.number().int().min(1900).max(new Date().getFullYear() + 10).optional(),
  doi: z.string().optional(),
  url: z.string().url('Invalid URL format').optional(),
  documentType: z.string().optional(),
  specialty: z.string().optional(),
  chunkId: z.string().optional(),
  pageNumber: z.number().int().positive().optional(),
  sectionTitle: z.string().optional(),
});

export const updateCitationSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  source: z.string().min(1, 'Source is required').optional(),
  authors: z.string().optional(),
  publicationYear: z.number().int().min(1900).max(new Date().getFullYear() + 10).optional(),
  doi: z.string().optional(),
  url: z.string().url('Invalid URL format').optional(),
  documentType: z.string().optional(),
  specialty: z.string().optional(),
  pageNumber: z.number().int().positive().optional(),
  sectionTitle: z.string().optional(),
});

export const searchCitationsQuerySchema = z.object({
  page: z.coerce.number().min(1, 'Page must be at least 1').default(1),
  limit: z.coerce.number().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').default(20),
  keyword: z.string().optional(),
  specialty: z.string().optional(),
  publicationYear: z.coerce.number().int().optional(),
  documentType: z.string().optional(),
});