"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRepository = void 0;
const prisma_1 = __importDefault(require("../../../config/prisma"));
class AuthRepository {
    async findByEmail(email) {
        return prisma_1.default.user.findUnique({ where: { email } });
    }
    async findById(id) {
        return prisma_1.default.user.findUnique({ where: { id } });
    }
    async create(userData) {
        return prisma_1.default.user.create({ data: userData });
    }
    async update(id, userData) {
        return prisma_1.default.user.update({ where: { id }, data: userData });
    }
    async setRefreshToken(id, refreshToken) {
        return prisma_1.default.user.update({ where: { id }, data: { refreshToken: refreshToken || undefined } });
    }
    async updatePassword(id, password) {
        return prisma_1.default.user.update({ where: { id }, data: { password } });
    }
    async createPasswordReset(email, token, expiresAt) {
        return prisma_1.default.passwordReset.create({
            data: { email, token, expiresAt },
        });
    }
    async findPasswordReset(token) {
        return prisma_1.default.passwordReset.findUnique({ where: { token } });
    }
    async markPasswordResetUsed(id) {
        return prisma_1.default.passwordReset.update({ where: { id }, data: { used: true } });
    }
    async deleteExpiredPasswordResets() {
        return prisma_1.default.passwordReset.deleteMany({
            where: { OR: [{ expiresAt: { lt: new Date() } }, { used: true }] },
        });
    }
    async createOtp(email, otp, expiresAt) {
        await prisma_1.default.otpVerification.deleteMany({ where: { email } });
        return prisma_1.default.otpVerification.create({
            data: { email, otp, expiresAt },
        });
    }
    async findOtp(email, otp) {
        return prisma_1.default.otpVerification.findFirst({
            where: { email, otp, used: false, expiresAt: { gt: new Date() } },
        });
    }
    async markOtpUsed(id) {
        return prisma_1.default.otpVerification.update({ where: { id }, data: { used: true } });
    }
    async deleteExpiredOtps() {
        return prisma_1.default.otpVerification.deleteMany({
            where: { OR: [{ expiresAt: { lt: new Date() } }, { used: true }] },
        });
    }
}
exports.AuthRepository = AuthRepository;
//# sourceMappingURL=auth.repository.js.map