import { Request, Response, NextFunction } from 'express';
import { ValidationService } from '../services/validation.service';
import { logger } from '../../../config/logger';

export class ValidationController {
  private validationService: ValidationService;

  constructor() {
    this.validationService = new ValidationService();
  }

  async getPending(req: Request, res: Response, next: NextFunction) {
    try {
      const pending = await this.validationService.getPending();
      res.status(200).json({ success: true, data: pending });
    } catch (error) {
      logger.error('Error in getPending controller:', error);
      next(error);
    }
  }

  async approve(req: Request, res: Response, next: NextFunction) {
    try {
      const { responseId } = req.params;
      const validatorId = req.user!.id;
      const { score, feedback } = req.body;

      await this.validationService.approve(responseId, validatorId, score, feedback);
      res.status(200).json({ success: true, message: 'Response approved' });
    } catch (error) {
      logger.error('Error in approve controller:', error);
      next(error);
    }
  }

  async reject(req: Request, res: Response, next: NextFunction) {
    try {
      const { responseId } = req.params;
      const validatorId = req.user!.id;
      const { feedback } = req.body;

      await this.validationService.reject(responseId, validatorId, feedback);
      res.status(200).json({ success: true, message: 'Response rejected' });
    } catch (error) {
      logger.error('Error in reject controller:', error);
      next(error);
    }
  }

  async getHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const validatorId = req.user!.id;
      const userRole = req.user!.role;
      const history = await this.validationService.getHistory(validatorId, userRole);
      res.status(200).json({ success: true, data: history });
    } catch (error) {
      logger.error('Error in getHistory controller:', error);
      next(error);
    }
  }

  async getReview(req: Request, res: Response, next: NextFunction) {
    try {
      const { responseId } = req.params;
      const review = await this.validationService.getReview(responseId);
      res.status(200).json({ success: true, data: review });
    } catch (error) {
      logger.error('Error in getReview controller:', error);
      next(error);
    }
  }

  async getApproved(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await this.validationService.getApproved(page, limit);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      logger.error('Error in getApproved controller:', error);
      next(error);
    }
  }

  async getRejected(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await this.validationService.getRejected(page, limit);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      logger.error('Error in getRejected controller:', error);
      next(error);
    }
  }
}