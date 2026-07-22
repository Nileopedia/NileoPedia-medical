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
    count: jest.fn(),
  },
  aIResponse: { count: jest.fn() },
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
        data: { userId: 'user-1', questionText: 'What is diabetes?', category: 'General' },
      });
      expect(result.status).toBe('processing');
    });

    it('should handle queue error gracefully without mock fallback', async () => {
      mockPrisma.question.create.mockResolvedValue({ id: 'q-2' });
      (aiQueue.add as jest.Mock).mockRejectedValue(new Error('Redis unavailable'));

      const result = await service.askQuestion('user-1', 'test');

      // Should return processing status but no mock response is generated
      expect(result.status).toBe('processing');
      expect(result.message).toBe('Question submitted for processing');
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

  describe('askQuestion', () => {
    it('should create question with category and queue for processing', async () => {
      mockPrisma.question.create.mockResolvedValue({ id: 'q-1', questionText: 'test', userId: 'user-1' });
      (aiQueue.add as jest.Mock).mockResolvedValue({ id: 'job-1' });

      const result = await service.askQuestion('user-1', 'What is diabetes?', 'endocrinology');

      expect(mockPrisma.question.create).toHaveBeenCalledWith({
        data: { userId: 'user-1', questionText: 'What is diabetes?', category: 'endocrinology' },
      });
      expect(result.status).toBe('processing');
      expect(aiQueue.add).toHaveBeenCalledWith(
        'generate',
        expect.objectContaining({
          questionId: 'q-1',
          specialty: 'endocrinology',
        }),
        expect.any(Object),
      );
    });

    it('should default category to General when no specialty provided', async () => {
      mockPrisma.question.create.mockResolvedValue({ id: 'q-1', questionText: 'test', userId: 'user-1' });
      (aiQueue.add as jest.Mock).mockResolvedValue({ id: 'job-1' });

      await service.askQuestion('user-1', 'test question');

      expect(mockPrisma.question.create).toHaveBeenCalledWith({
        data: { userId: 'user-1', questionText: 'test question', category: 'General' },
      });
    });

    it('should handle queue error gracefully', async () => {
      mockPrisma.question.create.mockResolvedValue({ id: 'q-2' });
      (aiQueue.add as jest.Mock).mockRejectedValue(new Error('Redis unavailable'));

      const result = await service.askQuestion('user-1', 'test');

      expect(result.status).toBe('processing');
      expect(result.message).toBe('Question submitted for processing');
    });
  });

  describe('getHistory', () => {
    it('should return paginated question history', async () => {
      const mockQuestions = [
        {
          id: 'q-1', questionText: 'Q1', category: 'General', createdAt: new Date(), aiResponse: null,
        },
      ];
      mockPrisma.question.findMany.mockResolvedValue(mockQuestions);
      mockPrisma.question.count.mockResolvedValue(1);

      const result = await service.getHistory('user-1', { page: 1, limit: 10 });

      expect(result.questions).toEqual(mockQuestions);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(1);
    });

    it('should apply category filter', async () => {
      mockPrisma.question.findMany.mockResolvedValue([]);
      mockPrisma.question.count.mockResolvedValue(0);

      await service.getHistory('user-1', { page: 1, limit: 10, category: 'cardiology' });

      expect(mockPrisma.question.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ category: 'cardiology' }),
        }),
      );
    });

    it('should apply date range filter', async () => {
      mockPrisma.question.findMany.mockResolvedValue([]);
      mockPrisma.question.count.mockResolvedValue(0);

      await service.getHistory('user-1', {
        page: 1,
        limit: 10,
        startDate: '2025-01-01',
        endDate: '2025-01-31',
      });

      expect(mockPrisma.question.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: expect.objectContaining({
              gte: expect.any(Date),
              lte: expect.any(Date),
            }),
          }),
        }),
      );
    });
  });

  describe('getQuestion', () => {
    it('should return question by id with aiResponse if present', async () => {
      const mockQuestion = {
        id: 'q-1',
        questionText: 'test question',
        aiResponse: {
          id: 'resp-1',
          questionId: 'q-1',
          summary: 'Test summary',
          keyFindings: ['Finding 1'],
          confidenceScore: 0.9,
          generatedBy: 'Llama-3.3-70b',
        },
      };
      mockPrisma.question.findUnique.mockResolvedValue(mockQuestion);

      const result = await service.getQuestion('q-1');

      expect(result.id).toBe('q-1');
      expect(result.aiResponse).toBeDefined();
      expect(result.aiResponse?.summary).toBe('Test summary');
    });

    it('should throw error when question not found', async () => {
      mockPrisma.question.findUnique.mockResolvedValue(null);

      await expect(service.getQuestion('nonexistent')).rejects.toThrow('Question not found');
    });

    it('should return unavailable message when no AI response', async () => {
      const mockQuestion = {
        id: 'q-1',
        questionText: 'test question',
        aiResponse: null,
      };
      mockPrisma.question.findUnique.mockResolvedValue(mockQuestion);

      const result = await service.getQuestion('q-1');

      expect(result).toHaveProperty('aiResponse');
      expect(result.aiResponse).toHaveProperty('summary', 'I could not find supporting medical information in the knowledge base.');
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
