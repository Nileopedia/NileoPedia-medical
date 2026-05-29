import { z } from 'zod';

export const emailSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1).max(200),
  html: z.string().min(1),
});

export const validatorOtpSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(1),
  otpCode: z.string().length(6),
});

export const passwordResetSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(1),
  resetLink: z.string().url(),
});

export const welcomeSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(1),
});

export const accountStatusSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(1),
  reason: z.string().optional(),
});

export const securityAlertSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(1),
  alertType: z.string().min(1),
  description: z.string().min(1),
  ipAddress: z.string().optional(),
});

export const systemAnnouncementSchema = z.object({
  recipients: z.array(z.string().email()),
  subject: z.string().min(1).max(200),
  title: z.string().min(1),
  message: z.string().min(1),
});

export function validateEmail(data: unknown): boolean {
  try {
    emailSchema.parse(data);
    return true;
  } catch {
    return false;
  }
}