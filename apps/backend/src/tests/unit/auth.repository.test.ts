/* eslint-env jest */
import { AuthRepository } from '../../modules/auth/repositories/auth.repository';
import prisma from '../../config/prisma';

jest.mock('../../config/prisma', () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  otp: {
    create: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
  },
  passwordReset: {
    create: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
  },
}));

describe('AuthRepository', () => {
  let repo: AuthRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new AuthRepository();
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const mockPrisma = prisma as any;
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-1', email: 'test@test.com' });

      const result = await repo.findByEmail('test@test.com');

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@test.com' } });
    });
  });

  describe('create', () => {
    it('should create user', async () => {
      const mockPrisma = prisma as any;
      mockPrisma.user.create.mockResolvedValue({ id: 'user-1' });

      const result = await repo.create({
        email: 'test@test.com',
        fullName: 'Test',
        password: 'hashed',
        role: 'MEDICAL_USER',
      });

      expect(mockPrisma.user.create).toHaveBeenCalled();
    });
  });
});