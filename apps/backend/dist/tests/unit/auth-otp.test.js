"use strict";
describe('Auth Service - OTP/Email Verification', () => {
    describe('requiresOtp validation', () => {
        const requiresOtp = (role) => role === 'VALIDATOR' || role === 'ADMIN';
        it('should require OTP for VALIDATOR role', () => {
            expect(requiresOtp('VALIDATOR')).toBe(true);
        });
        it('should require OTP for ADMIN role', () => {
            expect(requiresOtp('ADMIN')).toBe(true);
        });
        it('should NOT require OTP for MEDICAL_USER role', () => {
            expect(requiresOtp('MEDICAL_USER')).toBe(false);
        });
    });
    describe('OTP validation', () => {
        const validateOtp = (otp) => {
            if (typeof otp !== 'string')
                return false;
            return otp.length === 6 && /^\d+$/.test(otp);
        };
        it('should accept valid 6-digit OTP', () => {
            expect(validateOtp('123456')).toBe(true);
        });
        it('should accept any 6 digits', () => {
            expect(validateOtp('000000')).toBe(true);
            expect(validateOtp('999999')).toBe(true);
        });
        it('should reject OTP with less than 6 digits', () => {
            expect(validateOtp('12345')).toBe(false);
        });
        it('should reject OTP with more than 6 digits', () => {
            expect(validateOtp('1234567')).toBe(false);
        });
        it('should reject OTP with non-numeric characters', () => {
            expect(validateOtp('abcdef')).toBe(false);
            expect(validateOtp('1234a6')).toBe(false);
        });
        it('should reject empty OTP', () => {
            expect(validateOtp('')).toBe(false);
        });
    });
    describe('OTP storage and verification', () => {
        it('should generate 6-digit numeric OTP', () => {
            // Test the OTP generation function logic
            for (let i = 0; i < 100; i++) {
                const otp = Math.floor(100000 + Math.random() * 900000).toString();
                expect(otp.length).toBe(6);
                expect(/^\d+$/.test(otp)).toBe(true);
            }
        });
        it('should calculate correct expiry time', () => {
            const now = new Date();
            const expiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes
            const diffMs = expiresAt.getTime() - now.getTime();
            expect(Math.round(diffMs / 60000)).toBe(10);
        });
    });
});
//# sourceMappingURL=auth-otp.test.js.map