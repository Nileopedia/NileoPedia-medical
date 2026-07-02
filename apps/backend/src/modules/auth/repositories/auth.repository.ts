import prisma from '../../../config/prisma';

export class AuthRepository {
  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }

  async create(userData: {
    fullName: string;
    email: string;
    password: string;
    role: 'MEDICAL_USER' | 'VALIDATOR' | 'ADMIN';
    specialization?: string;
    institution?: string;
  }) {
    return prisma.user.create({ data: userData });
  }

  async update(id: string, userData: Partial<{
    fullName: string;
    email: string;
    password: string;
    specialization: string;
    institution: string;
    profileImage: string;
    isEmailVerified: boolean;
    accountStatus: 'ACTIVE' | 'SUSPENDED' | 'DISABLED';
  }>) {
    return prisma.user.update({ where: { id }, data: userData });
  }

  async setRefreshToken(id: string, refreshToken: string | null) {
    return prisma.user.update({ where: { id }, data: { refreshToken: refreshToken || undefined } });
  }

  async updatePassword(id: string, password: string) {
    return prisma.user.update({ where: { id }, data: { password } });
  }

  async createPasswordReset(email: string, token: string, expiresAt: Date) {
    return prisma.passwordReset.create({
      data: { email, token, expiresAt },
    });
  }

  async findPasswordReset(token: string) {
    return prisma.passwordReset.findUnique({ where: { token } });
  }

  async markPasswordResetUsed(id: string) {
    return prisma.passwordReset.update({ where: { id }, data: { used: true } });
  }

  async deleteExpiredPasswordResets() {
    return prisma.passwordReset.deleteMany({
      where: { OR: [{ expiresAt: { lt: new Date() } }, { used: true }] },
    });
  }

  async createOtp(email: string, otp: string, expiresAt: Date) {
    await prisma.otpVerification.deleteMany({ where: { email } });
    return prisma.otpVerification.create({
      data: { email, otp, expiresAt },
    });
  }

  async findOtp(email: string, otp: string) {
    return prisma.otpVerification.findFirst({
      where: {
        email, otp, used: false, expiresAt: { gt: new Date() },
      },
    });
  }

  async markOtpUsed(id: string) {
    return prisma.otpVerification.update({ where: { id }, data: { used: true } });
  }

  async deleteExpiredOtps() {
    return prisma.otpVerification.deleteMany({
      where: { OR: [{ expiresAt: { lt: new Date() } }, { used: true }] },
    });
  }
}
