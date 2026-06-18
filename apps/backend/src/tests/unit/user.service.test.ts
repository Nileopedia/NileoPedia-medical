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
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should exist', () => {
    const service = new UserService();
    expect(service).toBeDefined();
  });

  it('should have getCurrentUser method', () => {
    const service = new UserService();
    expect(typeof service.getCurrentUser).toBe('function');
  });

  it('should have updateProfile method', () => {
    const service = new UserService();
    expect(typeof service.updateProfile).toBe('function');
  });

  it('should have changePassword method', () => {
    const service = new UserService();
    expect(typeof service.changePassword).toBe('function');
  });
});