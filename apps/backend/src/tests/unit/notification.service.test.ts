/* eslint-env jest */
import { NotificationService } from '../../modules/notifications/notification.service';
import prisma from '../../config/prisma';

jest.mock('../../config/prisma', () => ({
  notification: {
    create: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  },
}));

jest.mock('../../config/logger', () => ({
  logger: { error: jest.fn(), info: jest.fn() },
}));

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new NotificationService();
  });

  describe('create', () => {
    it('should create notification', async () => {
      const mockPrisma = prisma as any;
      mockPrisma.notification.create.mockResolvedValue({ id: 'n-1' });

      const result = await service.create({
        userId: 'user-1',
        type: 'QUESTION_ANSWERED',
        title: 'Test',
        message: 'Test message',
      });

      expect(mockPrisma.notification.create).toHaveBeenCalled();
    });
  });

  describe('getByUserId', () => {
    it('should get notifications by user', async () => {
      const mockPrisma = prisma as any;
      mockPrisma.notification.findMany.mockResolvedValue([{ id: 'n-1' }]);

      const result = await service.getByUserId('user-1');

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      const mockPrisma = prisma as any;
      mockPrisma.notification.update.mockResolvedValue({ id: 'n-1', isRead: true });

      await service.markAsRead('n-1');

      expect(mockPrisma.notification.update).toHaveBeenCalled();
    });
  });
});