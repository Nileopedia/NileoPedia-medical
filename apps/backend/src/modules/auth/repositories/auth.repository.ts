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
}