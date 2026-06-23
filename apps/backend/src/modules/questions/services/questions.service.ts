import prisma from '../../../config/prisma';
import { aiQueue } from '../../../jobs/queues';
import { logger } from '../../../config/logger';
import { RetrievalService } from '../../retrieval/retrieval.service';
import { CONFIG } from '../../../config/env';

export class QuestionsService {
  async askQuestion(userId: string, questionText: string, specialty?: string) {
    try {
      const question = await prisma.question.create({
        data: { userId, questionText },
      });

      // Check if queue is available
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