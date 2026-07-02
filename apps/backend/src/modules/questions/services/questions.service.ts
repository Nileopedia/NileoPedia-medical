import prisma from '../../../config/prisma';
import { aiQueue } from '../../../jobs/queues';
import { logger } from '../../../config/logger';
import { RetrievalService } from '../../retrieval/retrieval.service';
import { CONFIG } from '../../../config/env';
import { AuditLogger } from '../../audit/audit.logger';

export class QuestionsService {
  async askQuestion(userId: string, questionText: string, specialty?: string) {
    try {
      const question = await prisma.question.create({
        data: { userId, questionText, category: specialty || 'General' },
      });

      if (aiQueue && typeof aiQueue.add === 'function') {
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
          logger.error('[ERROR] Queue unavailable:', queueError?.message);
        }
      }

      return {
        questionId: question.id,
        status: 'processing',
        message: 'Question submitted for processing',
      };
    } catch (error: any) {
      logger.error('[ERROR] askQuestion failed:', error);
      throw error;
    }
  }

  async getHistory(userId: string, options: { page?: number; limit?: number; category?: string; startDate?: string; endDate?: string } = {}) {
    const {
      page = 1, limit = 10, category, startDate, endDate,
    } = options;
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (category) where.category = category;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where,
        include: { aiResponse: { include: { citations: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.question.count({ where }),
    ]);

    return {
      questions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getSavedResponses(userId: string, options: { page?: number; limit?: number; search?: string } = {}) {
    const { page = 1, limit = 10, search } = options;
    const skip = (page - 1) * limit;

    const where: any = { userId, isSaved: true };
    if (search) {
      where.OR = [
        { questionText: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where,
        include: { aiResponse: { include: { citations: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.question.count({ where }),
    ]);

    return {
      questions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getQuestion(questionId: string) {
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: { aiResponse: { include: { citations: true } } },
    });

    if (!question) throw new Error('Question not found');

    // If no AI response exists, return question with empty response
    if (!question.aiResponse) {
      return {
        ...question,
        aiResponse: {
          summary: 'I could not find supporting medical information in the knowledge base.',
          keyFindings: [],
          detailedExplanation: '',
          confidenceScore: 0,
          generatedBy: 'Unavailable',
        },
      };
    }

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
