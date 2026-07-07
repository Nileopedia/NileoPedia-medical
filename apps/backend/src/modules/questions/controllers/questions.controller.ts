import { Request, Response, NextFunction } from 'express';
import { QuestionsService } from '../services/questions.service';
import { logger } from '../../../config/logger';
import { AuditLogger } from '../../audit/audit.logger';

export class QuestionsController {
  private questionsService: QuestionsService;

  constructor() {
    this.questionsService = new QuestionsService();
  }

  async askQuestion(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { question, specialty } = req.body;

      const result = await this.questionsService.askQuestion(userId, question, specialty);

      await AuditLogger.log(req, {
        action: 'QUESTION_ASKED',
        entityType: 'Question',
        entityId: result.questionId,
        description: 'User submitted a medical question',
      });

      res.status(201).json({
        success: true,
        message: 'Question submitted successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Error in askQuestion controller:', error);
      next(error);
    }
  }

  async getHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const category = req.query.category as string | undefined;
      const startDate = req.query.startDate as string | undefined;
      const endDate = req.query.endDate as string | undefined;

      const result = await this.questionsService.getHistory(userId, {
        page, limit, category, startDate, endDate,
      });

      res.status(200).json({
        success: true,
        data: {
          questions: result.questions,
          meta: {
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages,
          },
        },
      });
    } catch (error) {
      logger.error('Error in getHistory controller:', error);
      next(error);
    }
  }

  async getSavedResponses(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string | undefined;

      const result = await this.questionsService.getSavedResponses(userId, { page, limit, search });

      res.status(200).json({
        success: true,
        data: {
          questions: result.questions,
          meta: {
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages,
          },
        },
      });
    } catch (error) {
      logger.error('Error in getSavedResponses controller:', error);
      next(error);
    }
  }

  async getQuestion(req: Request, res: Response, next: NextFunction) {
    try {
      const { questionId } = req.params;
      const question = await this.questionsService.getQuestion(questionId);

      res.status(200).json({
        success: true,
        data: question,
      });
    } catch (error) {
      logger.error('Error in getQuestion controller:', error);
      next(error);
    }
  }

  async saveResponse(req: Request, res: Response, next: NextFunction) {
    try {
      const { questionId } = req.params;
      await this.questionsService.saveResponse(questionId, req.user!.id);

      await AuditLogger.log(req, {
        action: 'RESPONSE_SAVED',
        entityType: 'Question',
        entityId: questionId,
        description: 'User saved an AI response',
      });

      res.status(200).json({
        success: true,
        message: 'Response saved',
      });
    } catch (error) {
      logger.error('Error in saveResponse controller:', error);
      next(error);
    }
  }

  async unsaveResponse(req: Request, res: Response, next: NextFunction) {
    try {
      const { questionId } = req.params;
      await this.questionsService.unsaveResponse(questionId, req.user!.id);

      await AuditLogger.log(req, {
        action: 'RESPONSE_UNSAVED',
        entityType: 'Question',
        entityId: questionId,
        description: 'User unsaved an AI response',
      });

      res.status(200).json({
        success: true,
        message: 'Response unsaved',
      });
    } catch (error) {
      logger.error('Error in unsaveResponse controller:', error);
      next(error);
    }
  }
}
