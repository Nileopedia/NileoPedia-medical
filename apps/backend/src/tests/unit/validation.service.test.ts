/* eslint-env jest */
import { ValidationService } from '../../modules/validation/services/validation.service';

jest.mock('../../config/prisma', () => ({
  medicalDocument: {
    findMany: jest.fn(),
    update: jest.fn(),
  },
}));

jest.mock('../../jobs/queues', () => ({
  documentQueue: { add: jest.fn() },
}));

describe('ValidationService', () => {
  let service: ValidationService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ValidationService();
  });

  describe('getPendingDocuments', () => {
    it('should be callable', async () => {
      const prisma = require('../../../config/prisma');
      prisma.medicalDocument.findMany.mockResolvedValue([]);

      const result = await service.getPendingDocuments();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('approveDocument', () => {
    it('should be callable', async () => {
      const prisma = require('../../../config/prisma');
      prisma.medicalDocument.update.mockResolvedValue({});

      await service.approveDocument('doc-1', 'validator-1');
    });
  });

  describe('rejectDocument', () => {
    it('should be callable', async () => {
      const prisma = require('../../../config/prisma');
      prisma.medicalDocument.update.mockResolvedValue({});

      await service.rejectDocument('doc-1', 'validator-1', 'Not relevant');
    });
  });
});