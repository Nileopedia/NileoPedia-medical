import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/analytics.service';
import { logger } from '../../../config/logger';

export class AnalyticsController {
  private analyticsService: AnalyticsService;

  constructor() {
    this.analyticsService = new AnalyticsService();
  }

  async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const analytics = await this.analyticsService.getDashboard();
      res.status(200).json({ success: true, data: analytics });
    } catch (error) {
      logger.error('Error in getDashboard controller:', error);
      next(error);
    }
  }

  async getUserDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const analytics = await this.analyticsService.getUserDashboard(userId);
      res.status(200).json({ success: true, data: analytics });
    } catch (error) {
      logger.error('Error in getUserDashboard controller:', error);
      next(error);
    }
  }

  async getValidationMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const metrics = await this.analyticsService.getValidationMetrics();
      res.status(200).json({ success: true, data: metrics });
    } catch (error) {
      logger.error('Error in getValidationMetrics controller:', error);
      next(error);
    }
  }
}