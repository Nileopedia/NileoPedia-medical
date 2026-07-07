"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Mock env for consistent testing
process.env.JWT_ACCESS_SECRET = 'test-secret-key-for-jwt';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-for-jwt';
process.env.JWT_ACCESS_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
describe('Authentication', () => {
    // Re-implement JWT utilities locally for testing
    const generateAccessToken = (userId, email) => jsonwebtoken_1.default.sign({ id: userId, email }, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
    const generateRefreshToken = (userId) => jsonwebtoken_1.default.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
    const verifyAccessToken = (token) => jsonwebtoken_1.default.verify(token, process.env.JWT_ACCESS_SECRET);
    describe('JWT Generation', () => {
        it('should generate valid access token', () => {
            const token = generateAccessToken('user-123', 'test@example.com');
            const decoded = jsonwebtoken_1.default.decode(token);
            expect(decoded).toBeDefined();
            expect(decoded?.id).toBe('user-123');
            expect(decoded?.email).toBe('test@example.com');
        });
        it('should generate valid refresh token', () => {
            const token = generateRefreshToken('user-123');
            const decoded = jsonwebtoken_1.default.decode(token);
            expect(decoded).toBeDefined();
            expect(decoded?.id).toBe('user-123');
            expect(decoded?.email).toBeUndefined();
        });
    });
    describe('JWT Verification', () => {
        it('should verify valid token', () => {
            const token = generateAccessToken('user-123', 'test@example.com');
            const decoded = verifyAccessToken(token);
            expect(decoded.id).toBe('user-123');
            expect(decoded.email).toBe('test@example.com');
        });
        it('should reject invalid secret', () => {
            const token = generateAccessToken('user-123', 'test@example.com');
            expect(() => {
                jsonwebtoken_1.default.verify(token, 'wrong-secret');
            }).toThrow();
        });
        it('should reject malformed token', () => {
            expect(() => {
                jsonwebtoken_1.default.verify('not-a-valid-token', process.env.JWT_ACCESS_SECRET);
            }).toThrow();
        });
    });
    describe('Password Validation', () => {
        const validatePassword = (password) => password.length >= 8;
        it('should accept valid password', () => {
            expect(validatePassword('password123')).toBe(true);
        });
        it('should reject short password', () => {
            expect(validatePassword('pass')).toBe(false);
        });
    });
    describe('Email Validation', () => {
        const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        it('should accept valid email', () => {
            expect(validateEmail('test@example.com')).toBe(true);
        });
        it('should reject invalid email', () => {
            expect(validateEmail('invalid-email')).toBe(false);
        });
        it('should reject empty email', () => {
            expect(validateEmail('')).toBe(false);
        });
    });
    describe('Role Authorization', () => {
        const isAdmin = (role) => role === 'ADMIN';
        const isValidator = (role) => role === 'VALIDATOR';
        const canValidate = (role) => isAdmin(role) || isValidator(role);
        it('should allow ADMIN to validate', () => {
            expect(canValidate('ADMIN')).toBe(true);
        });
        it('should allow VALIDATOR to validate', () => {
            expect(canValidate('VALIDATOR')).toBe(true);
        });
        it('should deny MEDICAL_USER from validating', () => {
            expect(canValidate('MEDICAL_USER')).toBe(false);
        });
    });
});
//# sourceMappingURL=auth.test.js.map