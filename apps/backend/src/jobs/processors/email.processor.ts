import nodemailer from 'nodemailer';
import { EmailJob } from '../types';
import { logger } from '../../config/logger';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'localhost',
  port: parseInt(process.env.SMTP_PORT || '1025'),
  secure: false,
});

export async function processEmail(job: EmailJob) {
  const { to, subject, template, data } = job;

  try {
    const html = await renderTemplate(template, data || {});

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@nileopedia.test',
      to,
      subject,
      html,
    });

    logger.info(`Email sent to ${to} with template ${template}`);
    return { success: true };

  } catch (error) {
    logger.error(`Email sending failed to ${to}`, error);
    throw error;
  }
}

async function renderTemplate(template: string, data: Record<string, unknown>): Promise<string> {
  const templates: Record<string, string> = {
    otp: `<p>Your verification code: <strong>${data.code}</strong></p>`,
    passwordReset: `<p>Click to reset: <a href="${data.resetLink}">Reset Password</a></p>`,
    notification: `<h2>${data.title}</h2><p>${data.message}</p>`,
  };
  return templates[template] || `<p>${JSON.stringify(data)}</p>`;
}