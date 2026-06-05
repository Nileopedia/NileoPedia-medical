import { z } from 'zod';
import { Citation } from '@prisma/client';
import { createCitationSchema, searchCitationsQuerySchema } from './citation.validation';

export type CreateCitationDto = z.infer<typeof createCitationSchema>;

export type UpdateCitationDto = z.infer<typeof import('./citation.validation').updateCitationSchema>;

export type SearchCitationsQuery = z.infer<typeof searchCitationsQuerySchema>;

export interface SearchCitationsResult {
  citations: Citation[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}