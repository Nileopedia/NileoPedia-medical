"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-env jest */
const email_utils_1 = require("../../modules/email/email.utils");
describe('EmailUtils', () => {
    describe('validateEmail', () => {
        it('should return true for valid email data', () => {
            const result = (0, email_utils_1.validateEmail)({
                to: 'test@test.com',
                subject: 'Test',
                html: '<p>content</p>',
            });
            expect(result).toBe(true);
        });
        it('should return false for missing to', () => {
            const result = (0, email_utils_1.validateEmail)({
                subject: 'Test',
                html: '<p>content</p>',
            });
            expect(result).toBe(false);
        });
        it('should return false for missing subject', () => {
            const result = (0, email_utils_1.validateEmail)({
                to: 'test@test.com',
                html: '<p>content</p>',
            });
            expect(result).toBe(false);
        });
        it('should return false for invalid to format', () => {
            const result = (0, email_utils_1.validateEmail)({
                to: 'invalid-email',
                subject: 'Test',
                html: '<p>content</p>',
            });
            expect(result).toBe(false);
        });
    });
});
//# sourceMappingURL=email.utils.test.js.map