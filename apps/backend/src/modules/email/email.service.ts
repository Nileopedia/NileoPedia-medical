import { EmailType, EmailStatus } from './email.types';
import { emailTemplates } from './email.templates';
import { validateEmail } from './email.utils';
import prisma from '../../config/prisma';
import { logger } from '../../config/logger';
import { EmailJob } from '../../jobs/types';

const { RESEND_API_KEY } = process.env;
const { EMAIL_FROM } = process.env;
const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || 'resend';

const getEmailFrom = () => process.env.EMAIL_FROM || '';
const getApiKey = () => process.env.RESEND_API_KEY;

let resendClient: any = null;

export function resetResendClient() {
  resendClient = null;
}

async function getResendClient() {
  if (!resendClient) {
    const apiKey = getApiKey();
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not configured');
    }
    const { Resend } = await import('resend');
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

export class EmailService {
  static async sendValidatorOtp(data: { email: string; fullName: string; otpCode: string }): Promise<void> {
    const template = emailTemplates.validatorOtp(data);
    await this.sendEmail(data.email, template.subject, template.html, 'otp');
  }

  static async sendOtp(data: { email: string; fullName: string; otp: string }): Promise<void> {
    const template = emailTemplates.otpLogin(data);
    await this.sendEmail(data.email, template.subject, template.html, 'otp');
  }

  static async sendPasswordReset(data: { email: string; fullName: string; resetLink: string }): Promise<void> {
    const template = emailTemplates.passwordReset(data);
    await this.sendEmail(data.email, template.subject, template.html, 'passwordReset');
  }

  static async sendWelcome(data: { email: string; fullName: string }): Promise<void> {
    const template = emailTemplates.welcome(data);
    await this.sendEmail(data.email, template.subject, template.html, 'notification');
  }

  static async sendAccountActivated(data: { email: string; fullName: string; reason?: string }): Promise<void> {
    const template = emailTemplates.accountActivated(data);
    await this.sendEmail(data.email, template.subject, template.html, 'notification');
  }

  static async sendAccountDeactivated(data: { email: string; fullName: string; reason?: string }): Promise<void> {
    const template = emailTemplates.accountDeactivated(data);
    await this.sendEmail(data.email, template.subject, template.html, 'notification');
  }

  static async sendSecurityAlert(data: { email: string; fullName: string; alertType: string; description: string; ipAddress?: string }): Promise<void> {
    const template = emailTemplates.securityAlert({ ...data, ipAddress: data.ipAddress });
    await this.sendEmail(data.email, template.subject, template.html, 'notification');
  }

  static async sendSystemAnnouncement(recipients: string[], subject: string, title: string, message: string): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>${title}</h2>
        <p>${message}</p>
        <hr>
        <p style="font-size: 12px; color: #999;">NileoPedia Team</p>
      </div>
    `;

    for (const email of recipients) {
      await this.sendEmail(email, subject, html, 'notification');
    }
  }

  static async sendEmail(to: string, subject: string, html: string, template?: string): Promise<void> {
    if (!validateEmail({ to, subject, html })) {
      throw new Error('Invalid email data');
    }

    const pendingLog = await prisma.emailLog.create({
      data: {
        recipient: to,
        subject,
        status: EmailStatus.PENDING,
      },
    });

    try {
      await this.sendViaResend(to, subject, html);
      await prisma.emailLog.update({
        where: { id: pendingLog.id },
        data: { status: EmailStatus.SENT, sentAt: new Date() },
      });
      logger.info(`Email sent successfully to ${to}`, { type: template, subject });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      await prisma.emailLog.update({
        where: { id: pendingLog.id },
        data: { status: EmailStatus.FAILED, error: errorMessage },
      });
      logger.error(`Email sending failed to ${to}`, { type: template, subject, error: errorMessage });
      throw error;
    }
  }

  static async sendViaResend(to: string, subject: string, html: string): Promise<void> {
    const resend = await getResendClient();
    const result = await resend.emails.send({
      from: getEmailFrom(),
      to,
      subject,
      html,
    });

    logger.info(`Resend API response for ${to}`, {
      id: result.data?.id,
      status: 'queued',
    });
  }

  static getEmailProvider(): string {
    return EMAIL_PROVIDER;
  }

  static isConfigured(): boolean {
    return !!getApiKey() && !!getEmailFrom();
  }

  static async checkConnection(): Promise<{ provider: string; configured: boolean; status: string }> {
    try {
      const resend = await getResendClient();
      const configured = this.isConfigured();
      return {
        provider: 'resend',
        configured,
        status: configured ? 'connected' : 'disconnected',
      };
    } catch (error) {
      logger.error('Email connection check failed', error);
      return {
        provider: 'resend',
        configured: false,
        status: 'disconnected',
      };
    }
  }
}
