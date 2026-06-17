/* eslint-env jest */
import { IngestionController } from '../../modules/admin/controllers/ingestion.controller';

jest.mock('../../config/logger', () => ({
  logger: { error: jest.fn(), info: jest.fn() },
}));

describe('IngestionController', () => {
  let controller: IngestionController;

  beforeEach(() => {
    controller = new IngestionController();
  });

  describe('getIngestionStatus', () => {
    it('should be a function', () => {
      expect(typeof controller.getIngestionStatus).toBe('function');
    });
  });

  describe('triggerReindex', () => {
    it('should be a function', () => {
      expect(typeof controller.triggerReindex).toBe('function');
    });
  });
});