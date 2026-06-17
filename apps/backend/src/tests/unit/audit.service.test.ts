/* eslint-env jest */
import { AuditService } from '../../modules/audit/audit.service';
import prisma from '../../config/prisma';

jest.mock('../../config/prisma', () => ({
  auditLog: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
}));

describe('AuditService', () => {
  let service: AuditService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuditService();
  });

  describe('log', () => {
    it('should create audit log entry', async () => {
      const mockPrisma = prisma as any;
      mockPrisma.auditLog.create.mockResolvedValue({ id: 'audit-1' });

      await service.log({
        action: 'USER_LOGIN',
        userId: 'user-1',
        details: { ip: '127.0.0.1' },
      });
    });
  });

  describe('getLogs', () => {
    it('should get audit logs', async () => {
      const mockPrisma = prisma as any;
      mockPrisma.auditLog.findMany.mockResolvedValue([{ id: 'audit-1' }]);
      mockPrisma.auditLog.count.mockResolvedValue(1);

      const result = await service.getLogs({ page: 1, limit: 20 });

      expect(result.logs).toHaveLength(1);
    });
  });
});