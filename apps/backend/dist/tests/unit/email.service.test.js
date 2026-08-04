"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-env jest */
const email_service_1 = require("../../modules/email/email.service");
const email_types_1 = require("../../modules/email/email.types");
const prisma_1 = __importDefault(require("../../config/prisma"));
jest.mock('../../config/prisma', () => ({
    emailLog: {
        create: jest.fn(),
        update: jest.fn(),
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
        (0, email_service_1.resetResendClient)();
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
            await email_service_1.EmailService.sendViaResend('test@example.com', 'Test Subject', '<p>Hello</p>');
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
            await expect(email_service_1.EmailService.sendViaResend('test@example.com', 'Test', '<p>content</p>')).rejects.toThrow('Resend API error');
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
            await expect(email_service_1.EmailService.sendViaResend('test@example.com', 'Test', '<p>content</p>')).rejects.toThrow('ECONNREFUSED');
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
            const pendingLog = { id: 'log-1' };
            prisma_1.default.emailLog.create.mockResolvedValue(pendingLog);
            await email_service_1.EmailService.sendEmail('test@example.com', 'Subject', '<p>Body</p>');
            expect(prisma_1.default.emailLog.create).toHaveBeenCalledWith({
                data: {
                    recipient: 'test@example.com',
                    subject: 'Subject',
                    status: email_types_1.EmailStatus.PENDING,
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
            prisma_1.default.emailLog.create.mockResolvedValue(pendingLog);
            await email_service_1.EmailService.sendEmail('test@example.com', 'Subject', '<p>Body</p>');
            expect(prisma_1.default.emailLog.update).toHaveBeenCalledWith({
                where: { id: 'log-1' },
                data: {
                    status: email_types_1.EmailStatus.SENT,
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
            prisma_1.default.emailLog.create.mockResolvedValue(pendingLog);
            await expect(email_service_1.EmailService.sendEmail('test@example.com', 'Subject', '<p>Body</p>')).rejects.toThrow('API Error');
            expect(prisma_1.default.emailLog.update).toHaveBeenCalledWith({
                where: { id: 'log-1' },
                data: {
                    status: email_types_1.EmailStatus.FAILED,
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
            const result = await email_service_1.EmailService.checkConnection();
            expect(result).toEqual({
                provider: 'resend',
                configured: true,
                status: 'connected',
            });
        });
        it('should return disconnected when RESEND_API_KEY is missing', async () => {
            delete process.env.RESEND_API_KEY;
            delete process.env.EMAIL_FROM;
            const result = await email_service_1.EmailService.checkConnection();
            expect(result).toEqual({
                provider: 'resend',
                configured: false,
                status: 'disconnected',
            });
        });
        it('should return disconnected when EMAIL_FROM is missing', async () => {
            process.env.RESEND_API_KEY = 're_test';
            delete process.env.EMAIL_FROM;
            const result = await email_service_1.EmailService.checkConnection();
            expect(result.configured).toBe(false);
            expect(result.status).toBe('disconnected');
        });
    });
    describe('isConfigured', () => {
        it('should return true when both API key and from address are set', () => {
            process.env.RESEND_API_KEY = 're_test';
            process.env.EMAIL_FROM = 'test@example.com';
            expect(email_service_1.EmailService.isConfigured()).toBe(true);
        });
        it('should return false when RESEND_API_KEY is missing', () => {
            delete process.env.RESEND_API_KEY;
            expect(email_service_1.EmailService.isConfigured()).toBe(false);
        });
        it('should return false when EMAIL_FROM is missing', () => {
            delete process.env.EMAIL_FROM;
            expect(email_service_1.EmailService.isConfigured()).toBe(false);
        });
    });
    describe('getEmailProvider', () => {
        it('should always return resend', () => {
            expect(email_service_1.EmailService.getEmailProvider()).toBe('resend');
        });
    });
});
//# sourceMappingURL=email.service.test.js.map