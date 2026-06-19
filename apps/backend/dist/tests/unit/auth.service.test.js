"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-env jest */
const auth_service_1 = require("../../modules/auth/services/auth.service");
const jwt_service_1 = require("../../modules/auth/services/jwt.service");
const auth_repository_1 = require("../../modules/auth/repositories/auth.repository");
jest.mock('../../modules/auth/repositories/auth.repository');
jest.mock('../../modules/auth/services/jwt.service');
jest.mock('../../config/logger', () => ({
    logger: { info: jest.fn(), error: jest.fn() },
}));
jest.mock('bcryptjs', () => ({
    genSalt: jest.fn().mockResolvedValue('salt'),
    hash: jest.fn().mockResolvedValue('hashed-password'),
    compare: jest.fn().mockResolvedValue(true),
}));
describe('AuthService', () => {
    let service;
    let mockAuthRepository;
    let mockJwtService;
    const mockBcrypt = {
        genSalt: jest.fn().mockResolvedValue('salt'),
        hash: jest.fn().mockResolvedValue('hashed-password'),
        compare: jest.fn().mockResolvedValue(true),
    };
    beforeEach(() => {
        jest.clearAllMocks();
        mockAuthRepository = {
            findByEmail: jest.fn(),
            create: jest.fn(),
            setRefreshToken: jest.fn(),
            findById: jest.fn(),
            createOtp: jest.fn(),
            findOtp: jest.fn(),
            markOtpUsed: jest.fn(),
            createPasswordReset: jest.fn(),
            findPasswordReset: jest.fn(),
            updatePassword: jest.fn(),
            markPasswordResetUsed: jest.fn(),
        };
        mockJwtService = {
            generateAccessToken: jest.fn().mockReturnValue('mock-access-token'),
            generateRefreshToken: jest.fn().mockReturnValue('mock-refresh-token'),
            verifyRefreshToken: jest.fn().mockReturnValue({ id: 'user-1' }),
        };
        auth_repository_1.AuthRepository.mockImplementation(() => mockAuthRepository);
        jwt_service_1.JwtService.mockImplementation(() => mockJwtService);
        service = new auth_service_1.AuthService();
    });
    describe('register', () => {
        it('should register user successfully', async () => {
            mockAuthRepository.findByEmail.mockResolvedValue(null);
            mockAuthRepository.create.mockResolvedValue({
                id: 'user-1',
                email: 'test@test.com',
                fullName: 'Test User',
                role: 'MEDICAL_USER',
                accountStatus: 'ACTIVE',
            });
            const result = await service.register({
                email: 'test@test.com',
                password: 'password123',
                fullName: 'Test User',
                role: 'MEDICAL_USER',
            });
            expect(result.accessToken).toBe('mock-access-token');
            expect(result.refreshToken).toBe('mock-refresh-token');
        });
        it('should throw error when user already exists', async () => {
            mockAuthRepository.findByEmail.mockResolvedValue({ id: 'existing-user' });
            await expect(service.register({
                email: 'exists@test.com',
                password: 'password123',
                fullName: 'Test User',
                role: 'MEDICAL_USER',
            })).rejects.toThrow('User already exists');
        });
    });
    describe('login', () => {
        it('should login user successfully', async () => {
            mockAuthRepository.findByEmail.mockResolvedValue({
                id: 'user-1',
                email: 'test@test.com',
                password: 'hashed-password',
                fullName: 'Test User',
                role: 'MEDICAL_USER',
                accountStatus: 'ACTIVE',
            });
            mockBcrypt.compare.mockResolvedValueOnce(true);
            const result = await service.login({
                email: 'test@test.com',
                password: 'password123',
            });
            expect(result.accessToken).toBe('mock-access-token');
        });
        it('should throw error when user not found', async () => {
            mockAuthRepository.findByEmail.mockResolvedValue(null);
            await expect(service.login({
                email: 'notfound@test.com',
                password: 'password123',
            })).rejects.toThrow('Invalid credentials');
        });
    });
    describe('refreshToken', () => {
        it('should refresh token successfully', async () => {
            mockJwtService.verifyRefreshToken.mockReturnValue({ id: 'user-1' });
            mockAuthRepository.findById.mockResolvedValue({
                id: 'user-1',
                email: 'test@test.com',
                role: 'MEDICAL_USER',
                refreshToken: 'valid-refresh-token',
            });
            const result = await service.refreshToken({ refreshToken: 'valid-refresh-token' });
            expect(result.accessToken).toBe('mock-access-token');
        });
        it('should throw error for invalid refresh token', async () => {
            mockJwtService.verifyRefreshToken.mockReturnValue({ id: 'user-1' });
            mockAuthRepository.findById.mockResolvedValue(null);
            await expect(service.refreshToken({ refreshToken: 'invalid' }))
                .rejects.toThrow('Invalid refresh token');
        });
    });
    describe('logout', () => {
        it('should logout user successfully', async () => {
            await service.logout('user-1');
            expect(mockAuthRepository.setRefreshToken).toHaveBeenCalledWith('user-1', null);
        });
    });
    describe('requiresOtp', () => {
        it('should return true for VALIDATOR role', async () => {
            mockAuthRepository.findByEmail.mockResolvedValue({ role: 'VALIDATOR' });
            const result = await service.requiresOtp('validator@test.com');
            expect(result).toBe(true);
        });
        it('should return false for MEDICAL_USER role', async () => {
            mockAuthRepository.findByEmail.mockResolvedValue({ role: 'MEDICAL_USER' });
            const result = await service.requiresOtp('user@test.com');
            expect(result).toBe(false);
        });
        it('should throw error when user not found', async () => {
            mockAuthRepository.findByEmail.mockResolvedValue(null);
            await expect(service.requiresOtp('notfound@test.com'))
                .rejects.toThrow('User not found');
        });
    });
    describe('generateOtp', () => {
        it('should generate OTP for validator', async () => {
            mockAuthRepository.findByEmail.mockResolvedValue({
                id: 'user-1',
                email: 'validator@test.com',
                fullName: 'Validator User',
                role: 'VALIDATOR',
            });
            mockAuthRepository.createOtp.mockResolvedValue({ id: 'otp-1' });
            const otp = await service.generateOtp('validator@test.com');
            expect(otp).toHaveLength(6);
        });
        it('should generate OTP for admin', async () => {
            mockAuthRepository.findByEmail.mockResolvedValue({
                id: 'user-1',
                email: 'admin@test.com',
                fullName: 'Admin User',
                role: 'ADMIN',
            });
            mockAuthRepository.createOtp.mockResolvedValue({ id: 'otp-1' });
            const otp = await service.generateOtp('admin@test.com');
            expect(otp).toHaveLength(6);
        });
    });
    describe('verifyOtp', () => {
        it('should throw error for invalid OTP length', async () => {
            await expect(service.verifyOtp('test@test.com', '123'))
                .rejects.toThrow('Invalid OTP');
        });
        it('should throw error for invalid OTP', async () => {
            mockAuthRepository.findOtp.mockResolvedValue(null);
            await expect(service.verifyOtp('test@test.com', '123456'))
                .rejects.toThrow('Invalid or expired OTP');
        });
    });
    describe('forgotPassword', () => {
        it('should create password reset token', async () => {
            mockAuthRepository.findByEmail.mockResolvedValue({
                id: 'user-1',
                email: 'test@test.com',
                fullName: 'Test User',
            });
            mockAuthRepository.createPasswordReset.mockResolvedValue({ id: 'reset-1' });
            const result = await service.forgotPassword('test@test.com');
            expect(result.success).toBe(true);
        });
        it('should return success for non-existent user', async () => {
            mockAuthRepository.findByEmail.mockResolvedValue(null);
            const result = await service.forgotPassword('notfound@test.com');
            expect(result.success).toBe(true);
        });
    });
    describe('resetPassword', () => {
        it('should throw error for invalid token', async () => {
            await expect(service.resetPassword('test@test.com', '123', 'newPassword'))
                .rejects.toThrow('Invalid or expired reset token');
        });
        it('should throw error for invalid reset record', async () => {
            mockAuthRepository.findPasswordReset.mockResolvedValue(null);
            await expect(service.resetPassword('test@test.com', '123456', 'newPassword'))
                .rejects.toThrow('Invalid or expired reset token');
        });
    });
});
//# sourceMappingURL=auth.service.test.js.map