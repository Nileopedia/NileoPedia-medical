import { z } from 'zod';

export const createSystemNotificationSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  targetRoles: z.array(z.enum(['MEDICAL_USER', 'VALIDATOR', 'ADMIN'])).min(1, 'At least one target role is required'),
  metadata: z.record(z.unknown()).optional(),
});

export const getNotificationsQuerySchema = z.object({
  page: z.coerce.number().min(1, 'Page must be at least 1').default(1),
  limit: z.coerce.number().min(1, 'Limit must be at least 1').max(50, 'Limit cannot exceed 50').default(20),
});