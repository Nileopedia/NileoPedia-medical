import { z } from 'zod';

export const updateProfileSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').optional(),
  specialization: z.string().optional(),
  institution: z.string().optional(),
  profileImage: z.string().url('Invalid URL format').optional().or(z.literal('')),
  bio: z.string().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters long'),
});

export const getUsersQuerySchema = z.object({
  page: z.coerce.number().min(1, 'Page must be at least 1').default(1),
  limit: z.coerce.number().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').default(10),
  search: z.string().optional(),
});