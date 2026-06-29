/* eslint-env jest */
import { EmailService, resetResendClient } from '../../modules/email/email.service';
import { EmailStatus } from '../../modules/email/email.types';
import prisma from '../../config/prisma';

jest.mock('../../config/prisma', () => ({
  emailLog: {
    create: jest.fn(),
    updateMany: jest.fn(),
  },
}));

jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: jest.fn(),
    },
  })),
}));

describe('EmailService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    resetResendClient();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('sendViaResend', () => {
    it('should send email successfully via Resend', async () => {
      const mockResend = require('resend').Resend;
      mockResend.mockClear();
      const mockSend = jest.fn().mockResolvedValue({ data: { id: 'email-123' } });
      mockResend.mockImplementationOnce(() => ({
        emails: { send: mockSend },
      }));

      process.env.RESEND_API_KEY = 're_test';
      process.env.EMAIL_FROM = 'test@nileopedia.com';

      await EmailService.sendViaResend('test@example.com', 'Test Subject', '<p>Hello</p>');

      expect(mockSend).toHaveBeenCalledWith({
        from: 'test@nileopedia.com',
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Hello</p>',
      });
    });

    it('should throw error when Resend API fails', async () => {
      const mockResend = require('resend').Resend;
      mockResend.mockClear();
      const mockSend = jest.fn().mockRejectedValue(new Error('Resend API error'));
      mockResend.mockImplementationOnce(() => ({
        emails: { send: mockSend },
      }));

      process.env.RESEND_API_KEY = 're_test';
      process.env.EMAIL_FROM = 'test@nileopedia.com';

      await expect(
        EmailService.sendViaResend('test@example.com', 'Test', '<p>content</p>')
      ).rejects.toThrow('Resend API error');
    });

    it('should handle network errors from Resend', async () => {
      const mockResend = require('resend').Resend;
      mockResend.mockClear();
      const mockSend = jest.fn().mockRejectedValue(new Error('ECONNREFUSED'));
      mockResend.mockImplementationOnce(() => ({
        emails: { send: mockSend },
      }));

      process.env.RESEND_API_KEY = 're_test';
      process.env.EMAIL_FROM = 'test@nileopedia.com';

      await expect(
        EmailService.sendViaResend('test@example.com', 'Test', '<p>content</p>')
      ).rejects.toThrow('ECONNREFUSED');
    });
  });

  describe('sendEmail', () => {
    it('should log email to database before sending', async () => {
      const mockResend = require('resend').Resend;
      mockResend.mockClear();
      const mockSend = jest.fn().mockResolvedValue({ data: { id: 'email-123' } });
      mockResend.mockImplementationOnce(() => ({
        emails: { send: mockSend },
      }));

      process.env.RESEND_API_KEY = 're_test';
      process.env.EMAIL_FROM = 'test@nileopedia.com';

      await EmailService.sendEmail('test@example.com', 'Subject', '<p>Body</p>');

      expect(prisma.emailLog.create).toHaveBeenCalledWith({
        data: {
          recipient: 'test@example.com',
          subject: 'Subject',
          status: EmailStatus.PENDING,
        },
      });
    });

    it('should update email log to SENT on success', async () => {
      const mockResend = require('resend').Resend;
      mockResend.mockClear();
      const mockSend = jest.fn().mockResolvedValue({ data: { id: 'email-123' } });
      mockResend.mockImplementationOnce(() => ({
        emails: { send: mockSend },
      }));

      process.env.RESEND_API_KEY = 're_test';
      process.env.EMAIL_FROM = 'test@nileopedia.com';

      const pendingLog = { id: 'log-1' };
      (prisma.emailLog.create as jest.Mock).mockResolvedValue(pendingLog);

      await EmailService.sendEmail('test@example.com', 'Subject', '<p>Body</p>');

      expect(prisma.emailLog.update).toHaveBeenCalledWith({
        where: { id: 'log-1' },
        data: {
          status: EmailStatus.SENT,
          sentAt: expect.any(Date),
        },
      });
    });

    it('should update email log to FAILED on error', async () => {
      const mockResend = require('resend').Resend;
      mockResend.mockClear();
      const mockSend = jest.fn().mockRejectedValue(new Error('API Error'));
      mockResend.mockImplementationOnce(() => ({
        emails: { send: mockSend },
      }));

      process.env.RESEND_API_KEY = 're_test';
      process.env.EMAIL_FROM = 'test@nileopedia.com';

      const pendingLog = { id: 'log-1' };
      (prisma.emailLog.create as jest.Mock).mockResolvedValue(pendingLog);

      await expect(
        EmailService.sendEmail('test@example.com', 'Subject', '<p>Body</p>')
      ).rejects.toThrow('API Error');

      expect(prisma.emailLog.update).toHaveBeenCalledWith({
        where: { id: 'log-1' },
        data: {
          status: EmailStatus.FAILED,
          error: 'API Error',
        },
      });
    });
  });

  describe('checkConnection', () => {
    it('should return connected status when configured', async () => {
      const mockResend = require('resend').Resend;
      mockResend.mockClear();
      mockResend.mockImplementationOnce(() => ({
        emails: { send: jest.fn() },
      }));

      const result = await EmailService.checkConnection();

      expect(result).toEqual({
        provider: 'resend',
        configured: true,
        status: 'connected',
      });
    });

    it('should return disconnected when RESEND_API_KEY is missing', async () => {
      delete process.env.RESEND_API_KEY;
      delete process.env.EMAIL_FROM;

      const result = await EmailService.checkConnection();

      expect(result).toEqual({
        provider: 'resend',
        configured: false,
        status: 'disconnected',
      });
    });

    it('should return disconnected when EMAIL_FROM is missing', async () => {
      process.env.RESEND_API_KEY = 're_test';
      delete process.env.EMAIL_FROM;

      const result = await EmailService.checkConnection();

      expect(result.configured).toBe(false);
      expect(result.status).toBe('disconnected');
    });
  });

  describe('isConfigured', () => {
    it('should return true when both API key and from address are set', () => {
      process.env.RESEND_API_KEY = 're_test';
      process.env.EMAIL_FROM = 'test@example.com';
      expect(EmailService.isConfigured()).toBe(true);
    });

    it('should return false when RESEND_API_KEY is missing', () => {
      delete process.env.RESEND_API_KEY;
      expect(EmailService.isConfigured()).toBe(false);
    });

    it('should return false when EMAIL_FROM is missing', () => {
      delete process.env.EMAIL_FROM;
      expect(EmailService.isConfigured()).toBe(false);
    });
  });

  describe('getEmailProvider', () => {
    it('should always return resend', () => {
      expect(EmailService.getEmailProvider()).toBe('resend');
    });
  });
});
