import { UserRole, AccountStatus } from '@prisma/client';
import jwt from 'jsonwebtoken';
import prisma from '../../config/prisma';

export const generateTestJWT = (payload: { id: string; email: string; role: string }) => {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET || 'test-access-secret-key', {
    expiresIn: '15m',
  });
};

export const createTestUser = async (data: {
  email?: string;
  fullName?: string;
  role?: UserRole;
  password?: string;
}) => {
  const user = await prisma.user.create({
    data: {
      email: data.email || `test-${Date.now()}@example.com`,
      fullName: data.fullName || 'Test User',
      role: data.role || 'MEDICAL_USER',
      password: data.password || '$2a$10$testhashedpassword',
      accountStatus: AccountStatus.ACTIVE,
    },
  });
  return user;
};

export const createTestAdmin = async () => {
  return createTestUser({ role: 'ADMIN' });
};

export const createTestValidator = async () => {
  return createTestUser({ role: 'VALIDATOR' });
};

export const createTestMedicalUser = async () => {
  return createTestUser({ role: 'MEDICAL_USER' });
};

export const createAuthHeader = (token: string) => ({
  Authorization: `Bearer ${token}`,
});

export const cleanupDatabase = async () => {
  await prisma.notification.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.citation.deleteMany({});
  await prisma.aIResponse.deleteMany({});
  await prisma.question.deleteMany({});
  await prisma.embeddingMetadata.deleteMany({});
  await prisma.medicalDocument.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.user.deleteMany({});
};

jest.mock('../../config/prisma', () => require('../mocks/services.mock').mockPrismaClient);