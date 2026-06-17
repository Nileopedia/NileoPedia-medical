/* eslint-env jest */
import { UserService } from '../../modules/users/user.service';

jest.mock('../../config/prisma', () => ({
  user: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
}));

jest.mock('bcryptjs', () => ({
  compare: jest.fn().mockResolvedValue(true),
  genSalt: jest.fn().mockResolvedValue('salt'),
  hash: jest.fn().mockResolvedValue('hashed'),
}));

describe('UserService', () => {
  let service: UserService;
  let mockPrisma: any;
  let mockBcrypt: any;

  beforeEach(() => {
    jest.clearAllMocks();
    const prisma = require('../../config/prisma');
    mockPrisma = prisma;
    const bcrypt = require('bcryptjs');
    mockBcrypt = bcrypt;
    service = new UserService();
  });

  describe('getCurrentUser', () => {
    it('should return current user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-1', fullName: 'Test' });

      const result = await service.getCurrentUser('user-1');

      expect(result?.id).toBe('user-1');
    });

    it('should throw error when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.getCurrentUser('nonexistent')).rejects.toThrow('User not found');
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      mockPrisma.user.update.mockResolvedValue({ id: 'user-1', fullName: 'Updated' });

      const result = await service.updateProfile('user-1', { fullName: 'Updated' });

      expect(mockPrisma.user.update).toHaveBeenCalled();
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-1', password: 'old' });
      mockPrisma.user.update.mockResolvedValue({});

      await service.changePassword('user-1', { currentPassword: 'old', newPassword: 'new' });

      expect(mockPrisma.user.update).toHaveBeenCalled();
    });
  });

  describe('getUsers', () => {
    it('should return users with pagination', async () => {
      mockPrisma.user.findMany.mockResolvedValue([{ id: 'user-1' }]);
      mockPrisma.user.count.mockResolvedValue(1);

      const result = await service.getUsers({ page: 1, limit: 20 });

      expect(result.users).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  describe('deactivateUser', () => {
    it('should deactivate user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-1' });
      mockPrisma.user.update.mockResolvedValue({});

      await service.deactivateUser('user-1');

      expect(mockPrisma.user.update).toHaveBeenCalled();
    });
  });

  describe('activateUser', () => {
    it('should activate user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-1' });
      mockPrisma.user.update.mockResolvedValue({});

      await service.activateUser('user-1');

      expect(mockPrisma.user.update).toHaveBeenCalled();
    });
  });
});