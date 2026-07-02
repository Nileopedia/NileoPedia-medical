import { Request, Response, NextFunction } from 'express';
import { AuditService } from './audit.service';
import { logger } from '../../config/logger';

export class AuditController {
  private auditService: AuditService;

  constructor() {
    this.auditService = new AuditService();
  }

  async getAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const query = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        action: req.query.action as string,
        entityType: req.query.entityType as string,
        userId: req.query.userId as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
      };

      const result = await this.auditService.getAuditLogs(query);

      res.status(200).json({
        success: true,
        data: {
          logs: result.logs,
          pagination: {
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages,
          },
        },
      });
    } catch (error) {
      logger.error('Error in getAuditLogs controller:', error);
      next(error);
    }
  }

  async getAuditLogById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const log = await this.auditService.getAuditLogById(id);

      if (!log) {
        return res.status(404).json({
          success: false,
          message: 'Audit log not found',
        });
      }

      res.status(200).json({
        success: true,
        data: log,
      });
    } catch (error) {
      logger.error('Error in getAuditLogById controller:', error);
      next(error);
    }
  }

  async getUserActivityLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const query = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
      };

      const result = await this.auditService.getUserActivityLogs(userId, query);

      res.status(200).json({
        success: true,
        data: {
          logs: result.logs,
          pagination: {
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages,
          },
        },
      });
    } catch (error) {
      logger.error('Error in getUserActivityLogs controller:', error);
      next(error);
    }
  }

  async getValidationActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const query = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
      };

      const result = await this.auditService.getValidationActivity(query);

      res.status(200).json({
        success: true,
        data: {
          logs: result.logs,
          pagination: {
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages,
          },
        },
      });
    } catch (error) {
      logger.error('Error in getValidationActivity controller:', error);
      next(error);
    }
  }

  async getSecurityEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const query = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
      };

      const result = await this.auditService.getSecurityEvents(query);

      res.status(200).json({
        success: true,
        data: {
          logs: result.logs,
          pagination: {
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages,
          },
        },
      });
    } catch (error) {
      logger.error('Error in getSecurityEvents controller:', error);
      next(error);
    }
  }
}
