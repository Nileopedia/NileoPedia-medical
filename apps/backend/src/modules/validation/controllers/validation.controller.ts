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
      const history = await this.validationService.getHistory(validatorId);
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
}