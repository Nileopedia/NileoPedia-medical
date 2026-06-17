/* eslint-env jest */
import { EmailService } from '../../modules/email/email.service';
import { emailTemplates } from '../../modules/email/email.templates';

jest.mock('../../config/prisma', () => ({
  emailLog: {
    create: jest.fn(),
    updateMany: jest.fn(),
  },
}));

jest.mock('../../config/logger', () => ({
  logger: { error: jest.fn(), info: jest.fn(), warn: jest.fn() },
}));

jest.mock('../../jobs/queues', () => ({
  emailQueue: { add: jest.fn().mockResolvedValue({}), addBulk: jest.fn().mockResolvedValue({}) },
}));

describe('EmailService', () => {
  describe('emailTemplates', () => {
    it('should exist', () => {
      expect(emailTemplates).toBeDefined();
    });

    it('should have otpLogin template', () => {
      const result = emailTemplates.otpLogin({ email: 'test@test.com', fullName: 'Test', otp: '123456' });
      expect(result.html).toContain('123456');
    });

    it('should have passwordReset template', () => {
      const result = emailTemplates.passwordReset({ email: 'test@test.com', fullName: 'Test', resetLink: 'http://test' });
      expect(result.html).toContain('http://test');
    });

    it('should have welcome template', () => {
      const result = emailTemplates.welcome({ email: 'test@test.com', fullName: 'Test' });
      expect(result.html).toBeDefined();
    });
  });

  describe('EmailService static methods', () => {
    it('should have sendOtp method', () => {
      expect(typeof EmailService.sendOtp).toBe('function');
    });

    it('should have sendPasswordReset method', () => {
      expect(typeof EmailService.sendPasswordReset).toBe('function');
    });

    it('should have sendWelcome method', () => {
      expect(typeof EmailService.sendWelcome).toBe('function');
    });
  });
});