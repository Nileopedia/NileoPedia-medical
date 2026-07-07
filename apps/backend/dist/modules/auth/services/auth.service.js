"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const auth_repository_1 = require("../repositories/auth.repository");
const jwt_service_1 = require("./jwt.service");
const logger_1 = require("../../../config/logger");
class AuthService {
    constructor() {
        this.authRepository = new auth_repository_1.AuthRepository();
        this.jwtService = new jwt_service_1.JwtService();
    }
    async register(registerDto) {
        const { fullName, email, password, role, institution, specialization, } = registerDto;
        const existingUser = await this.authRepository.findByEmail(email);
        if (existingUser) {
            throw new Error('User already exists');
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(password, salt);
        const user = await this.authRepository.create({
            fullName,
            email,
            password: hashedPassword,
            role,
            institution,
            specialization,
        });
        const accessToken = this.jwtService.generateAccessToken({
            id: user.id,
            email: user.email,
            role: user.role,
        });
        const refreshToken = this.jwtService.generateRefreshToken({
            id: user.id,
        });
        await this.authRepository.setRefreshToken(user.id, refreshToken);
        return {
            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                institution: user.institution,
                specialization: user.specialization,
                accountStatus: user.accountStatus,
            },
            accessToken,
            refreshToken,
        };
    }
    async login(loginDto) {
        const { email, password } = loginDto;
        const user = await this.authRepository.findByEmail(email);
        if (!user) {
            throw new Error('Invalid credentials');
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }
        const accessToken = this.jwtService.generateAccessToken({
            id: user.id,
            email: user.email,
            role: user.role,
        });
        const refreshToken = this.jwtService.generateRefreshToken({
            id: user.id,
        });
        await this.authRepository.setRefreshToken(user.id, refreshToken);
        return {
            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                institution: user.institution,
                specialization: user.specialization,
                accountStatus: user.accountStatus,
            },
            accessToken,
            refreshToken,
        };
    }
    async refreshToken(refreshTokenDto) {
        const { refreshToken } = refreshTokenDto;
        const payload = this.jwtService.verifyRefreshToken(refreshToken);
        const user = await this.authRepository.findById(payload.id);
        if (!user) {
            throw new Error('Invalid refresh token');
        }
        if (user.refreshToken !== refreshToken) {
            throw new Error('Invalid refresh token');
        }
        const accessToken = this.jwtService.generateAccessToken({
            id: user.id,
            email: user.email,
            role: user.role,
        });
        const newRefreshToken = this.jwtService.generateRefreshToken({
            id: user.id,
        });
        await this.authRepository.setRefreshToken(user.id, newRefreshToken);
        return {
            accessToken,
            refreshToken: newRefreshToken,
        };
    }
    async logout(userId) {
        await this.authRepository.setRefreshToken(userId, null);
    }
    async requiresOtp(email) {
        const user = await this.authRepository.findByEmail(email);
        if (!user) {
            throw new Error('User not found');
        }
        return user.role === 'VALIDATOR' || user.role === 'ADMIN';
    }
    async generateOtp(email) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
        await this.authRepository.createOtp(email, otp, expiresAt);
        try {
            const { EmailService } = await Promise.resolve().then(() => __importStar(require('../../email/email.service')));
            const user = await this.authRepository.findByEmail(email);
            await EmailService.sendOtp({ email, fullName: user?.fullName || 'User', otp });
            logger_1.logger.info(`OTP email sent to ${email}`);
        }
        catch (error) {
            logger_1.logger.info(`OTP for ${email}: ${otp}`);
        }
        return otp;
    }
    async verifyOtp(email, otp) {
        if (!otp || otp.length !== 6) {
            throw new Error('Invalid OTP');
        }
        const otpRecord = await this.authRepository.findOtp(email, otp);
        if (!otpRecord) {
            throw new Error('Invalid or expired OTP');
        }
        const user = await this.authRepository.findByEmail(email);
        if (!user) {
            throw new Error('User not found');
        }
        await this.authRepository.markOtpUsed(otpRecord.id);
        const accessToken = this.jwtService.generateAccessToken({
            id: user.id,
            email: user.email,
            role: user.role,
        });
        const refreshToken = this.jwtService.generateRefreshToken({
            id: user.id,
        });
        await this.authRepository.setRefreshToken(user.id, refreshToken);
        return {
            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                institution: user.institution,
                specialization: user.specialization,
                accountStatus: user.accountStatus,
            },
            accessToken,
            refreshToken,
        };
    }
    async forgotPassword(email) {
        const user = await this.authRepository.findByEmail(email);
        if (user) {
            const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry
            await this.authRepository.createPasswordReset(email, resetToken, expiresAt);
            const resetLink = `${process.env.FRONTEND_URL}/reset-password?email=${encodeURIComponent(email)}&token=${resetToken}`;
            try {
                const { EmailService } = await Promise.resolve().then(() => __importStar(require('../../email/email.service')));
                await EmailService.sendPasswordReset({
                    email,
                    fullName: user.fullName,
                    resetLink,
                });
                logger_1.logger.info(`Password reset email sent to ${email}`);
            }
            catch (error) {
                logger_1.logger.info(`Reset link for ${email}: ${resetLink}`);
            }
        }
        return { success: true };
    }
    async resetPassword(email, token, newPassword) {
        if (!token || token.length < 6) {
            throw new Error('Invalid or expired reset token');
        }
        const resetRecord = await this.authRepository.findPasswordReset(token);
        if (!resetRecord) {
            throw new Error('Invalid or expired reset token');
        }
        if (resetRecord.email !== email) {
            throw new Error('Invalid or expired reset token');
        }
        if (resetRecord.expiresAt < new Date()) {
            throw new Error('Reset token has expired');
        }
        if (resetRecord.used) {
            throw new Error('Reset token has already been used');
        }
        const user = await this.authRepository.findByEmail(email);
        if (!user) {
            throw new Error('User not found');
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, salt);
        await this.authRepository.updatePassword(user.id, hashedPassword);
        await this.authRepository.markPasswordResetUsed(resetRecord.id);
        return { success: true };
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map