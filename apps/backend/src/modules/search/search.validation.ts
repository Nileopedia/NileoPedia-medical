import { z } from 'zod';

const searchTypes = ['semantic', 'keyword', 'hybrid'] as const;

export const searchQuerySchema = z.object({
  q: z.string().min(1, 'Search query is required').max(500, 'Search query too long'),
  type: z.enum(searchTypes).default('hybrid'),
  specialty: z.string().optional(),
  limit: z.coerce.number().min(1, 'Limit must be at least 1').max(50, 'Limit cannot exceed 50').default(20),
  page: z.coerce.number().min(1, 'Page must be at least 1').default(1),
  publicationYear: z.coerce.number().int().optional(),
  documentType: z.string().optional(),
});

export const semanticSearchSchema = z.object({
  q: z.string().min(1, 'Search query is required').max(500, 'Search query too long'),
  topK: z.coerce.number().min(1).max(50).default(10),
  specialty: z.string().optional(),
});

export const keywordSearchSchema = z.object({
  q: z.string().min(1, 'Search query is required').max(500, 'Search query too long'),
  limit: z.coerce.number().min(1).max(50).default(20),
  specialty: z.string().optional(),
});