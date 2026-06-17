/* eslint-env jest */
import { validateEmail } from '../../modules/email/email.utils';

describe('EmailUtils', () => {
  describe('validateEmail', () => {
    it('should return true for valid email data', () => {
      const result = validateEmail({
        to: 'test@test.com',
        subject: 'Test',
        html: '<p>content</p>',
      });
      expect(result).toBe(true);
    });

    it('should return false for missing to', () => {
      const result = validateEmail({
        subject: 'Test',
        html: '<p>content</p>',
      } as any);
      expect(result).toBe(false);
    });

    it('should return false for missing subject', () => {
      const result = validateEmail({
        to: 'test@test.com',
        html: '<p>content</p>',
      } as any);
      expect(result).toBe(false);
    });

    it('should return false for invalid to format', () => {
      const result = validateEmail({
        to: 'invalid-email',
        subject: 'Test',
        html: '<p>content</p>',
      });
      expect(result).toBe(false);
    });
  });
});