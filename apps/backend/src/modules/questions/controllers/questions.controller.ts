import { Request, Response, NextFunction } from 'express';
import { QuestionsService } from '../services/questions.service';
import { logger } from '../../../config/logger';

export class QuestionsController {
  private questionsService: QuestionsService;

  constructor() {
    this.questionsService = new QuestionsService();
  }

  async askQuestion(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }
      const userId = req.user!.id;
      const { question } = req.body;

      const result = await this.questionsService.askQuestion(userId, question);

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
      const questions = await this.questionsService.getHistory(userId);

      res.status(200).json({
        success: true,
        data: questions,
      });
    } catch (error) {
      logger.error('Error in getHistory controller:', error);
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