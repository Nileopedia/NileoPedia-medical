/* eslint-env jest */
import { QuestionsController } from '../../modules/questions/controllers/questions.controller';
import { QuestionsService } from '../../modules/questions/services/questions.service';

const mockService = {
  askQuestion: jest.fn().mockResolvedValue({ questionId: 'q-1', status: 'processing' }),
  getHistory: jest.fn().mockResolvedValue([]),
  getQuestion: jest.fn().mockResolvedValue({ id: 'q-1', questionText: 'test' }),
  saveResponse: jest.fn().mockResolvedValue(undefined),
  unsaveResponse: jest.fn().mockResolvedValue(undefined),
};

jest.mock('../../modules/questions/services/questions.service', () => ({
  QuestionsService: jest.fn().mockImplementation(() => mockService),
}));

jest.mock('../../config/logger', () => ({
  logger: { error: jest.fn(), info: jest.fn() },
}));

describe('QuestionsController', () => {
  let controller: QuestionsController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new QuestionsController();
  });

  it('should have methods', () => {
    expect(typeof controller.askQuestion).toBe('function');
    expect(typeof controller.getHistory).toBe('function');
    expect(typeof controller.getQuestion).toBe('function');
    expect(typeof controller.saveResponse).toBe('function');
    expect(typeof controller.unsaveResponse).toBe('function');
  });
});
