import { Request, Response, NextFunction } from 'express';
import { ValidationService } from '../services/validation.service';
import { logger } from '../../../config/logger';
import { AuditLogger } from '../../../modules/audit/audit.logger';

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

      await AuditLogger.log(req, {
        action: 'VALIDATION_APPROVED',
        entityType: 'AIResponse',
        entityId: responseId,
        description: 'Validator approved an AI response',
      });

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

      await AuditLogger.log(req, {
        action: 'VALIDATION_REJECTED',
        entityType: 'AIResponse',
        entityId: responseId,
        description: 'Validator rejected an AI response',
      });

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
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string | undefined;
      const startDate = req.query.startDate as string | undefined;
      const history = await this.validationService.getHistory(validatorId, userRole, page, limit, search, startDate);
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

  async getFeedbackReports(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await this.validationService.getFeedbackReports(page, limit);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      logger.error('Error in getFeedbackReports controller:', error);
      next(error);
    }
  }

  async updateFeedbackReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { reportId } = req.params;
      const { severity, status } = req.body;
      await this.validationService.updateFeedbackReport(reportId, severity, status);
      res.status(200).json({ success: true, message: 'Feedback report updated' });
    } catch (error) {
      logger.error('Error in updateFeedbackReport controller:', error);
      next(error);
    }
  }

  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const validatorId = req.user!.id;
      const profile = await this.validationService.getProfile(validatorId);
      res.status(200).json({ success: true, data: profile });
    } catch (error) {
      logger.error('Error in getProfile controller:', error);
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const validatorId = req.user!.id;
      const profile = await this.validationService.updateProfile(validatorId, req.body);
      res.status(200).json({ success: true, data: profile });
    } catch (error) {
      logger.error('Error in updateProfile controller:', error);
      next(error);
    }
  }

  async getSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const validatorId = req.user!.id;
      const settings = await this.validationService.getSettings(validatorId);
      res.status(200).json({ success: true, data: settings });
    } catch (error) {
      logger.error('Error in getSettings controller:', error);
      next(error);
    }
  }

  async updateSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const validatorId = req.user!.id;
      const settings = await this.validationService.updateSettings(validatorId, req.body);
      res.status(200).json({ success: true, data: settings });
    } catch (error) {
      logger.error('Error in updateSettings controller:', error);
      next(error);
    }
  }
}
