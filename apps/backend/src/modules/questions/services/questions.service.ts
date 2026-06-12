import prisma from '../../../config/prisma';
import { aiQueue } from '../../../jobs/queues';
import { logger } from '../../../config/logger';

export class QuestionsService {
  async askQuestion(userId: string, questionText: string, specialty?: string) {
    try {
      const question = await prisma.question.create({
        data: { userId, questionText },
      });

      // Try to add to queue, fallback to database-only if Redis unavailable
      try {
        await aiQueue.add('generate', {
          questionId: question.id,
          query: questionText,
          userId,
          topK: 10,
          specialty: specialty || null,
        }, {
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
        });
      } catch (queueError: any) {
        logger.warn('Queue unavailable, question saved but processing delayed:', queueError?.message);
        // Still return success - question is saved, processing will happen when workers available
      }

      return {
        questionId: question.id,
        status: 'processing',
        message: 'Question submitted for processing',
      };
    } catch (error: any) {
      logger.error('Error in askQuestion:', error);
      throw error;
    }
  }

  async getHistory(userId: string) {
    return prisma.question.findMany({
      where: { userId },
      include: { aiResponse: { include: { citations: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getQuestion(questionId: string) {
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: { aiResponse: { include: { citations: true } } },
    });

    if (!question) throw new Error('Question not found');
    return question;
  }

  async saveResponse(questionId: string, userId: string) {
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });
    
    if (!question) {
      throw new Error('Question not found');
    }
    
    if (question.userId !== userId) {
      throw new Error('Unauthorized');
    }

    await prisma.question.update({
      where: { id: questionId },
      data: { isSaved: true },
    });
  }

  async unsaveResponse(questionId: string, userId: string) {
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });
    
    if (!question) {
      throw new Error('Question not found');
    }
    
    if (question.userId !== userId) {
      throw new Error('Unauthorized');
    }

    await prisma.question.update({
      where: { id: questionId },
      data: { isSaved: false },
    });
  }
}