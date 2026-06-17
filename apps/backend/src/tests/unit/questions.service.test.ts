/* eslint-env jest */
import { QuestionsService } from '../../modules/questions/services/questions.service';
import prisma from '../../config/prisma';
import { aiQueue } from '../../jobs/queues';

jest.mock('../../config/prisma', () => ({
  question: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
}));

jest.mock('../../jobs/queues', () => ({
  aiQueue: { add: jest.fn() },
}));

jest.mock('../../config/logger', () => ({
  logger: { error: jest.fn(), warn: jest.fn(), info: jest.fn() },
}));

describe('QuestionsService', () => {
  let service: QuestionsService;
  let mockPrisma: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma = prisma as jest.Mocked<typeof prisma>;
    service = new QuestionsService();
  });

  describe('askQuestion', () => {
    it('should create question and queue for processing', async () => {
      mockPrisma.question.create.mockResolvedValue({ id: 'q-1', questionText: 'test question' });
      (aiQueue.add as jest.Mock).mockResolvedValue({ id: 'job-1' });

      const result = await service.askQuestion('user-1', 'What is diabetes?');

      expect(mockPrisma.question.create).toHaveBeenCalledWith({
        data: { userId: 'user-1', questionText: 'What is diabetes?' },
      });
      expect(result.status).toBe('processing');
    });

    it('should handle queue error gracefully', async () => {
      mockPrisma.question.create.mockResolvedValue({ id: 'q-2' });
      (aiQueue.add as jest.Mock).mockRejectedValue(new Error('Redis unavailable'));

      const result = await service.askQuestion('user-1', 'test');

      expect(result.status).toBe('processing');
    });

    it('should include specialty in queue job', async () => {
      mockPrisma.question.create.mockResolvedValue({ id: 'q-3' });
      (aiQueue.add as jest.Mock).mockResolvedValue({ id: 'job-1' });

      await service.askQuestion('user-1', 'question', 'cardiology');

      expect(aiQueue.add).toHaveBeenCalledWith('generate', expect.objectContaining({
        specialty: 'cardiology',
      }), expect.any(Object));
    });
  });

  describe('getHistory', () => {
    it('should return question history for user', async () => {
      const mockQuestions = [
        { id: 'q-1', questionText: 'Question 1' },
        { id: 'q-2', questionText: 'Question 2' },
      ];
      mockPrisma.question.findMany.mockResolvedValue(mockQuestions);

      const result = await service.getHistory('user-1');

      expect(result).toEqual(mockQuestions);
    });

    it('should order by createdAt descending', async () => {
      await service.getHistory('user-1');

      expect(mockPrisma.question.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        }),
      );
    });
  });

  describe('getQuestion', () => {
    it('should return question by id', async () => {
      const mockQuestion = { id: 'q-1', questionText: 'test question' };
      mockPrisma.question.findUnique.mockResolvedValue(mockQuestion);

      const result = await service.getQuestion('q-1');

      expect(result).toEqual(mockQuestion);
    });

    it('should throw error when question not found', async () => {
      mockPrisma.question.findUnique.mockResolvedValue(null);

      await expect(service.getQuestion('nonexistent')).rejects.toThrow('Question not found');
    });
  });

  describe('saveResponse', () => {
    it('should save question response', async () => {
      mockPrisma.question.findUnique.mockResolvedValue({
        id: 'q-1',
        userId: 'user-1',
      });
      mockPrisma.question.update.mockResolvedValue({});

      await service.saveResponse('q-1', 'user-1');

      expect(mockPrisma.question.update).toHaveBeenCalledWith({
        where: { id: 'q-1' },
        data: { isSaved: true },
      });
    });

    it('should throw error when question not found', async () => {
      mockPrisma.question.findUnique.mockResolvedValue(null);

      await expect(service.saveResponse('q-1', 'user-1')).rejects.toThrow('Question not found');
    });

    it('should throw error when unauthorized', async () => {
      mockPrisma.question.findUnique.mockResolvedValue({
        id: 'q-1',
        userId: 'other-user',
      });

      await expect(service.saveResponse('q-1', 'user-1')).rejects.toThrow('Unauthorized');
    });
  });

  describe('unsaveResponse', () => {
    it('should unsave question response', async () => {
      mockPrisma.question.findUnique.mockResolvedValue({
        id: 'q-1',
        userId: 'user-1',
      });
      mockPrisma.question.update.mockResolvedValue({});

      await service.unsaveResponse('q-1', 'user-1');

      expect(mockPrisma.question.update).toHaveBeenCalledWith({
        where: { id: 'q-1' },
        data: { isSaved: false },
      });
    });

    it('should throw error when question not found', async () => {
      mockPrisma.question.findUnique.mockResolvedValue(null);

      await expect(service.unsaveResponse('q-1', 'user-1')).rejects.toThrow('Question not found');
    });

    it('should throw error when unauthorized', async () => {
      mockPrisma.question.findUnique.mockResolvedValue({
        id: 'q-1',
        userId: 'other-user',
      });

      await expect(service.unsaveResponse('q-1', 'user-1')).rejects.toThrow('Unauthorized');
    });
  });
});