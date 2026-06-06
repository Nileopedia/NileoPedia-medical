import { EmailType, EmailStatus } from './email.types';
import { emailTemplates } from './email.templates';
import { validateEmail } from './email.utils';
import prisma from '../../config/prisma';
import { logger } from '../../config/logger';
import { EmailJob } from '../../jobs/types';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@nileopedia.com';
const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || 'resend';

let resendClient: any = null;

async function getResendClient() {
  if (!resendClient && RESEND_API_KEY) {
    const { Resend } = await import('resend');
    resendClient = new Resend(RESEND_API_KEY);
  }
  return resendClient;
}

export class EmailService {
  static async sendValidatorOtp(data: { email: string; fullName: string; otpCode: string }): Promise<void> {
    const template = emailTemplates.validatorOtp(data);
    await this.queueEmail(data.email, template.subject, template.html, 'otp');
  }

  static async sendPasswordReset(data: { email: string; fullName: string; resetLink: string }): Promise<void> {
    const template = emailTemplates.passwordReset(data);
    await this.queueEmail(data.email, template.subject, template.html, 'passwordReset');
  }

  static async sendWelcome(data: { email: string; fullName: string }): Promise<void> {
    const template = emailTemplates.welcome(data);
    await this.queueEmail(data.email, template.subject, template.html, 'notification');
  }

  static async sendAccountActivated(data: { email: string; fullName: string; reason?: string }): Promise<void> {
    const template = emailTemplates.accountActivated(data);
    await this.queueEmail(data.email, template.subject, template.html, 'notification');
  }

  static async sendAccountDeactivated(data: { email: string; fullName: string; reason?: string }): Promise<void> {
    const template = emailTemplates.accountDeactivated(data);
    await this.queueEmail(data.email, template.subject, template.html, 'notification');
  }

  static async sendSecurityAlert(data: { email: string; fullName: string; alertType: string; description: string; ipAddress?: string }): Promise<void> {
    const template = emailTemplates.securityAlert({ ...data, ipAddress: data.ipAddress });
    await this.queueEmail(data.email, template.subject, template.html, 'notification');
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
    
    const { emailQueue } = await import('../../jobs/queues');
    const jobs = recipients.map((email) => ({
      name: 'announcement',
      data: { to: email, subject, html, template: 'notification', data: { title, message } },
    }));
    
    await emailQueue.addBulk(jobs);
  }

  private static async queueEmail(to: string, subject: string, html: string, template: string): Promise<void> {
    if (!validateEmail({ to, subject, html })) {
      throw new Error('Invalid email data');
    }

    await prisma.emailLog.create({
      data: {
        recipient: to,
        subject,
        status: EmailStatus.PENDING,
      },
    });

    try {
      const { emailQueue } = await import('../../jobs/queues');
      const jobData: EmailJob = { to, subject, template, html };
      await emailQueue.add('send', jobData);
    } catch (error) {
      // Fallback to direct send when Redis/queue unavailable (demo mode)
      logger.warn('Redis queue unavailable, sending email directly');
      await this.sendEmail(to, subject, html);
      await prisma.emailLog.updateMany({
        where: { recipient: to, subject },
        data: { status: EmailStatus.SENT, sentAt: new Date() },
      });
    }
  }

  static async sendEmail(to: string, subject: string, html: string): Promise<void> {
    if (EMAIL_PROVIDER === 'resend') {
      await this.sendViaResend(to, subject, html);
    } else {
      await this.sendViaNodemailer(to, subject, html);
    }
  }

  private static async sendViaResend(to: string, subject: string, html: string): Promise<void> {
    try {
      const resend = await getResendClient();
      if (!resend) {
        throw new Error('Resend client not configured');
      }
      await resend.emails.send({
        from: EMAIL_FROM,
        to,
        subject,
        html,
      });
    } catch (error) {
      logger.error('Resend email failed, falling back to Nodemailer', error);
      await this.sendViaNodemailer(to, subject, html);
    }
  }

  private static async sendViaNodemailer(to: string, subject: string, html: string): Promise<void> {
    const nodemailer = await import('nodemailer');
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '1025'),
    });
    await transporter.sendMail({
      from: EMAIL_FROM,
      to,
      subject,
      html,
    });
  }
}