import { EmailService } from '../../modules/email/email.service';
import { EmailJob } from '../types';
import { logger } from '../../config/logger';

export async function processEmail(job: EmailJob) {
  const {
    to, subject, html, template, data,
  } = job;

  try {
    const emailHtml = html || (template ? renderTemplate(template!, data || {}) : '');

    await EmailService.sendViaResend(to, subject, emailHtml);

    logger.info(`Email sent to ${to} via Resend`, { template, subject });
    return { success: true };
  } catch (error) {
    logger.error(`Email sending failed to ${to}`, { template, subject, error });
    throw error;
  }
}

function renderTemplate(template: string, data: Record<string, unknown>): string {
  const templates: Record<string, string> = {
    otp: `<p>Your verification code: <strong>${data.code || data.otp || '------'}</strong></p>`,
    passwordReset: `<p>Click to reset: <a href="${data.resetLink || '#'}">Reset Password</a></p>`,
    notification: `<h2>${data.title || ''}</h2><p>${data.message || ''}</p>`,
  };
  return templates[template] || `<p>${JSON.stringify(data)}</p>`;
}
